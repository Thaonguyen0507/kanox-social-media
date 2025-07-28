import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import { Form, Button, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContext";
import { WebSocketContext } from "../../context/WebSocketContext";
import { FaPaperclip, FaPaperPlane, FaPhone, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import useMedia from "../../hooks/useMedia";
import MediaActionBar from "../../components/utils/MediaActionBar";

const Chat = ({ chatId, messages, onMessageUpdate, onSendMessage }) => {
    const { user, token } = useContext(AuthContext);
    const { publish, subscribe, unsubscribe } = useContext(WebSocketContext) || {};
    const navigate = useNavigate(); // Khởi tạo useNavigate

    console.log("🚩 Chat rendering with messages:", messages);
    // const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [typingUsers, setTypingUsers] = useState([]);
    const [recipientName, setRecipientName] = useState("");
    const [selectedMediaFiles, setSelectedMediaFiles] = useState([]);
    const [selectedMediaPreviews, setSelectedMediaPreviews] = useState([]);
    const [isSpam, setIsSpam] = useState(false);
    const chatContainerRef = useRef(null);
    const isConnectedRef = useRef(false);
    const lastMessageIdRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const targetUserId = useRef(null);
    const [resolvedTargetId, setResolvedTargetId] = useState(null);
    const messagesRef = useRef(messages);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const {
        mediaData,
        loading: mediaLoading,
        error: mediaError,
    } = useMedia(
        resolvedTargetId ? [resolvedTargetId] : [],
        "PROFILE",
        "image"
    );

    const avatarUrl = mediaData?.[resolvedTargetId]?.[0]?.url || "/assets/default-avatar.png";

    useEffect(() => {
        if (messages?.length > 0) {
            const firstSenderId = messages[0].senderId;
            if (firstSenderId !== user.id) {
                targetUserId.current = firstSenderId;
            } else {
                const recipient = messages.find(m => m.senderId !== user.id);
                if (recipient) targetUserId.current = recipient.senderId;
            }

            if (targetUserId.current) {
                setResolvedTargetId(targetUserId.current);
            }
        }
    }, [messages, user.id]);

    const fetchUnreadMessageCount = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/chat/messages/unread-count`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.ok) {
                const messageData = await response.json();
                window.dispatchEvent(
                    new CustomEvent("updateUnreadCount", {
                        detail: { unreadCount: messageData.unreadCount || 0 },
                    })
                );
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };


    useEffect(() => {
        if (!token || !user || !chatId) {
            toast.error("Vui lòng đăng nhập để sử dụng chat.");
            return;
        }

        const subscriptions = [];
        const handleMessage = (data) => {
            console.log("Received WebSocket message:", data);
            if (data.id && data.content) {
                if (onMessageUpdate && typeof data.id !== "undefined") {
                    const isDuplicate = messagesRef.current.some((msg) => msg.id === data.id);
                    if (!isDuplicate) {
                        onMessageUpdate(data);
                    } else {
                        console.warn("Duplicate message ignored:", data);
                    }
                }
                fetchUnreadMessageCount();
            } else if (data.isTyping !== undefined && data.userId !== user?.id) {
                setTypingUsers((prev) => {
                    if (data.isTyping && !prev.includes(data.username)) {
                        return [...prev, data.username];
                    } else if (!data.isTyping) {
                        return prev.filter((u) => u !== data.username);
                    }
                    return prev;
                });
                if (data.isTyping) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
                    }, 3000);
                }
            } else if (data.unreadCount !== undefined) {
                window.dispatchEvent(
                    new CustomEvent("updateUnreadCount", {
                        detail: { unreadCount: data.unreadCount || 0 },
                    })
                );
            }
        };

        const handleSpamStatus = (data) => {
            console.log("Received spam status update:", data);
            if (data.chatId === Number(chatId)) {
                setIsSpam(data.isSpam);
                toast.info(data.isSpam ? "Người dùng đã được đánh dấu là spam" : "Người dùng đã được bỏ đánh dấu spam");
            }
        };

        subscriptions.push(subscribe(`/topic/chat/${chatId}`, handleMessage, `chat-${chatId}`));
        subscriptions.push(subscribe(`/topic/typing/${chatId}`, handleMessage, `typing-${chatId}`));
        subscriptions.push(subscribe(`/topic/unread-count/${user.id}`, handleMessage, `unread-count-${user.id}`));
        subscriptions.push(subscribe(`/topic/spam-status/${chatId}`, handleSpamStatus, `spam-status-${chatId}`));

        // Lấy trạng thái is_spam ban đầu
        fetch(`${process.env.REACT_APP_API_URL}/chat/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (response) => {
                const data = await response.json();
                if (response.ok) {
                    setRecipientName(data.name || "Unknown User");
                    // Giả định API trả về danh sách thành viên với isSpam
                    const membersResponse = await fetch(`${process.env.REACT_APP_API_URL}/chat/${chatId}/members`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (membersResponse.ok) {
                        const members = await membersResponse.json();
                        const recipient = members.find((member) => member.userId !== user.id);
                        setIsSpam(recipient?.isSpam || false);
                    }
                } else {
                    throw new Error(data.message || "Lỗi khi lấy thông tin chat.");
                }
            })
            .catch((err) => toast.error(err.message || "Lỗi khi lấy thông tin chat."));

        return () => {
            subscriptions.forEach((_, index) => unsubscribe(`chat-${chatId}-${index}`));
            clearTimeout(typingTimeoutRef.current);
            isConnectedRef.current = false;
        };
    }, [chatId, user, token, publish, subscribe, unsubscribe, onMessageUpdate]);

    const handleMarkSpam = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/mark-spam`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ chatId: Number(chatId), targetUserId: messages[0]?.senderId !== user.id ? messages[0]?.senderId : null }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi khi đánh dấu spam: ${errorText}`);
            }
            setIsSpam(true);
            toast.success("Đã đánh dấu người dùng là spam");
        } catch (err) {
            toast.error(err.message || "Lỗi khi đánh dấu spam");
        }
    };

    const handleUnmarkSpam = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/unmark-spam`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ chatId: Number(chatId), targetUserId: messages[0]?.senderId !== user.id ? messages[0]?.senderId : null }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi khi bỏ đánh dấu spam: ${errorText}`);
            }
            setIsSpam(false);
            toast.success("Đã bỏ đánh dấu spam cho người dùng");
        } catch (err) {
            toast.error(err.message || "Lỗi khi bỏ đánh dấu spam");
        }
    };


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, typingUsers]);

    const handleFileSelect = useCallback(async (files) => {
        const previews = [];

        for (const file of files) {
            const mediaType = file.type.startsWith("image/")
                ? (file.type === "image/gif" ? "gif" : "image")
                : file.type.startsWith("video/") ? "video" : "other";

            const formData = new FormData();
            formData.append("userId", user.id);
            formData.append("targetId", chatId);
            formData.append("targetTypeCode", "MESSAGE");
            formData.append("mediaTypeName", mediaType);
            formData.append("file", file);

            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/media/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!res.ok) throw new Error("Upload thất bại");
                const data = await res.json();

                if (selectedMediaPreviews.length + previews.length >= 15) {
                    toast.error("Chỉ gửi tối đa 15 ảnh/video mỗi tin nhắn");
                    return;
                }

                previews.push({
                    url: data.url,
                    type: file.type,
                    uploadedUrl: data.url,
                    mediaType: data.mediaTypeName,
                });
            } catch (err) {
                toast.error("Không thể gửi file: " + err.message);
            }
        }

        setSelectedMediaFiles((prev) => [...prev, ...files]);
        setSelectedMediaPreviews((prev) => [...prev, ...previews]);
    }, [user.id, chatId, token, selectedMediaPreviews.length]);

    useEffect(() => {
        const handlePaste = async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf("image") !== -1) {
                    const file = item.getAsFile();
                    if (file) {
                        await handleFileSelect([file]); // dùng lại hàm upload của bạn
                    }
                }
            }
        };

        const input = inputRef.current;
        if (input) {
            input.addEventListener("paste", handlePaste);
        }

        return () => {
            if (input) {
                input.removeEventListener("paste", handlePaste);
            }
        };
    }, [handleFileSelect]);

    const chunkMedia = (mediaList, size = 3) => {
        const chunks = [];
        for (let i = 0; i < mediaList.length; i += size) {
            chunks.push(mediaList.slice(i, i + size));
        }
        return chunks;
    };

    const sendMessage = async () => {
        if (!message.trim() && selectedMediaPreviews.length === 0) return;

        if (selectedMediaPreviews.length > 0) {
            const formData = new FormData();
            formData.append("content", message.trim() || "");
            selectedMediaPreviews.forEach((media, index) => {
                formData.append(`media[${index}].url`, media.uploadedUrl);
                formData.append(`media[${index}].type`, media.mediaType);
            });

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/${chatId}/send-message-with-media`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Lỗi khi gửi tin nhắn với media");
                }

                const data = await response.json();
                console.log("📤 Sent via REST API:", data);

                setMessage("");
                setSelectedMediaPreviews([]);
                setSelectedMediaFiles([]);
            } catch (err) {
                toast.error("Không thể gửi tin nhắn với media: " + err.message);
            }
        } else {
            const msg = {
                chatId: Number(chatId),
                senderId: user.id,
                content: message.trim(),
                mediaList: [],
                typeId: 1, // text
            };
            publish("/app/sendMessage", msg);
            setMessage("");
        }

        publish("/app/typing", {
            chatId: Number(chatId),
            userId: user.id,
            username: user.username,
            isTyping: false,
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sendTyping = () => {
        if (message.length > 0) {
            publish("/app/typing", {
                chatId: Number(chatId),
                userId: user.id,
                username: user.username,
                isTyping: true,
            });
            console.log("Sent typing status");
        } else {
            publish("/app/typing", {
                chatId: Number(chatId),
                userId: user.id,
                username: user.username,
                isTyping: false,
            });
        }
    };

// Hàm điều hướng đến trang Call
    const handleStartCall = () => {
        navigate(`/call/${chatId}`);
    };



    return (
        <div className="flex flex-col h-full bg-white text-black dark:bg-[#121212] dark:text-white">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                    />
                    <h5 className="text-base font-semibold mb-0 text-[var(--text-color)]">{recipientName}</h5>
                </div>
                <div className="flex items-center gap-2">
                    <OverlayTrigger
                        placement="left"
                        overlay={
                            <Tooltip className="!bg-[var(--tooltip-bg-color)] !text-[var(--text-color)]">
                                Gọi video
                            </Tooltip>
                        }
                    >
                        <button onClick={handleStartCall} className="btn-outline">
                            <FaPhone />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="left"
                        overlay={
                            <Tooltip className="!bg-[var(--tooltip-bg-color)] !text-[var(--text-color)]">
                                {isSpam ? "Bỏ đánh dấu spam" : "Đánh dấu spam"}
                            </Tooltip>
                        }
                    >
                        <button
                            onClick={isSpam ? handleUnmarkSpam : handleMarkSpam}
                            className={`btn-outline ${
                                isSpam ? "border-green-500 text-green-500 hover:bg-green-100 dark:hover:bg-green-900" : "border-yellow-500 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                            }`}
                        >
                            {isSpam ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        </button>
                    </OverlayTrigger>
                </div>
            </div>

            {/* Message List */}
            <div className="flex-grow overflow-y-auto p-4 max-h-[calc(100vh-200px)] scrollbar-hide" ref={chatContainerRef}>
                {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    const isMissedCall = msg.typeId === 4;
                    return (
                        <div key={msg.id} className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`p-3 rounded-3xl shadow max-w-[70%] text-sm break-words ${
                                    isMissedCall
                                        ? "bg-yellow-100 text-yellow-800 italic"
                                        : isOwn
                                            ? "bg-message-own"
                                            : "bg-message-other"
                                }`}
                            >
                                {isMissedCall ? (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="mr-2">{msg.content}</span>
                                        <button
                                            onClick={() => navigate(`/call/${chatId}`)}
                                            className="text-sm text-[var(--primary-color)] hover:underline"
                                        >
                                            Gọi lại
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>{msg.content}</div>

                                        {msg.mediaList?.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {msg.mediaList.map((media, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="relative w-full aspect-square overflow-hidden rounded"
                                                    >
                                                        {media.type === "image" ? (
                                                            <img
                                                                src={media.url}
                                                                className="w-full h-full object-cover"
                                                                alt="media"
                                                            />
                                                        ) : media.type === "video" ? (
                                                            <video
                                                                src={media.url}
                                                                className="w-full h-full object-cover"
                                                                controls
                                                            />
                                                        ) : (
                                                            <div className="text-xs text-red-500">
                                                                Không hỗ trợ media
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="text-end mt-1">
                                            <small className="text-xs text-light">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </small>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                {typingUsers.length > 0 && (
                    <div className="text-sm text-[var(--text-color-muted)] mt-2">
                        {typingUsers.join(", ")} đang nhập...
                    </div>
                )}
            </div>

            {/* Input + Upload + Emoji */}
            <div className="p-3 border-t border-dark bg-dark">
                {/* Media preview */}
                {selectedMediaPreviews.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto mb-3">
                        {selectedMediaPreviews.map((media, idx) => (
                            <div
                                key={idx}
                                className="relative w-20 h-20 border border-dark rounded overflow-hidden"
                            >
                                {media.type.startsWith("image/") ? (
                                    <img src={media.url} className="w-full h-full object-cover" alt="preview" />
                                ) : (
                                    <video src={media.url} className="w-full h-full object-cover" controls />
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedMediaPreviews((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                        );
                                        setSelectedMediaFiles((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                        );
                                    }}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="flex items-center bg-input gap-2 rounded-xl px-3 py-2 shadow-sm border border-[var(--border-color)]">
                    <MediaActionBar
                        onFileSelect={handleFileSelect}
                        onSelectEmoji={(emoji) => {
                            const input = inputRef.current;
                            if (!input) return;

                            const start = input.selectionStart;
                            const end = input.selectionEnd;

                            const newText =
                                message.substring(0, start) + emoji.emoji + message.substring(end);
                            setMessage(newText);

                            setTimeout(() => {
                                input.focus();
                                const cursorPosition = start + emoji.emoji.length;
                                input.setSelectionRange(cursorPosition, cursorPosition);
                            }, 0);
                        }}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            sendTyping();
                        }}
                        onKeyPress={handleKeyPress}
                        className="flex-grow bg-transparent outline-none text-[var(--text-color)] placeholder:text-[var(--text-color-muted)]"
                    />
                    <button
                        onClick={sendMessage}
                        className="p-2 text-[var(--text-color)] hover:text-[var(--primary-color)]"
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Chat;
