import React from "react";
import { FaCheckCircle, FaCircle, FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";

function NotificationItem({ notification, handleMarkRead, handleMarkUnread }) {
    const navigate = useNavigate();
    const isRead = notification.isRead;

    const handleNotificationClick = () => {
        if (notification.targetType === "POST") {
            if (!notification.targetId) {
                toast.error("Không thể điều hướng: Thiếu ID bài đăng.");
                return;
            }
            navigate(`/home?postId=${notification.targetId}`);
        } else if (notification.targetType === "GROUP") {
            if (!notification.targetId) {
                toast.error("Không thể điều hướng: Thiếu ID nhóm.");
                return;
            }
            navigate(`/community/${notification.targetId}`);
        } else if (
            notification.targetType === "PROFILE" &&
            notification.username &&
            notification.username !== "unknown"
        ) {
            navigate(`/profile/${notification.username}`);
        } else {
            toast.error("Không thể điều hướng: Thông tin không hợp lệ.");
        }
    };

    const renderMessageWithLink = () => {
        const displayName = notification.displayName || notification.username || "Người dùng";
        const message = notification.message || "Không có nội dung";

        if (notification.type === "POST_COMMENT" && notification.targetType === "POST") {
            return (
                <p
                    className="mb-1 text-[var(--text-color)] cursor-pointer hover:underline"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!notification.targetId) {
                            toast.error("Không thể điều hướng: Thiếu ID bài đăng.");
                            return;
                        }
                        navigate(`/home?postId=${notification.targetId}`);
                    }}
                >
                    {message.replace("{displayName}", displayName)}
                </p>
            );
        }

        // Trường hợp GROUP notification
        if (notification.targetType === "GROUP" && displayName && message.includes(displayName)) {
            const parts = message.split(displayName);
            return (
                <p className="mb-1 text-[var(--text-color)]">
                    {parts[0]}
                    <span
                        className="font-bold text-[var(--primary-color)] cursor-pointer hover:underline"
                        onClick={() => navigate(`/community/${notification.targetId}`)}
                    >
                    {displayName}
                </span>
                    {parts[1]}
                </p>
            );
        }

        return (
            <p className="mb-1 text-[var(--text-color)]">
                {message.replace("{displayName}", displayName)}
            </p>
        );
    };

    const renderAvatar = () => (
        <img
            src={
                notification.type === "POST_COMMENT"
                    ? notification.senderAvatar || notification.image || "https://placehold.co/40x40?text=Avatar"
                    : notification.image || "https://placehold.co/40x40?text=Avatar"
            }
            alt={`Avatar của ${notification.senderDisplayName || notification.displayName || "Người dùng"}`}
            className={`w-10 h-10 object-cover mr-3 ${
                notification.targetType === "GROUP" ? "rounded-none" : "rounded-full"
            }`}
        />
    );

    return (
        <div
            className={`p-3 border-b ${
                !isRead ? "bg-[var(--hover-bg-color)]" : "opacity-75"
            } transition-colors duration-200 hover:bg-[var(--hover-bg-color)] cursor-pointer`}
            onClick={handleNotificationClick}
        >
            <div className="flex items-start">
                {renderAvatar()}
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <p
                            className="font-bold text-[var(--primary-color)] cursor-pointer m-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.targetType === "GROUP") {
                                    if (!notification.targetId) {
                                        toast.error("Không thể điều hướng: Thiếu ID nhóm.");
                                        return;
                                    }
                                    navigate(`/community/${notification.targetId}`);
                                } else if (notification.username && notification.username !== "unknown") {
                                    navigate(`/profile/${notification.username}`);
                                } else {
                                    toast.error("Không thể điều hướng: Thiếu thông tin người dùng.");
                                }
                            }}
                        >
                            {notification.type === "POST_COMMENT"
                                ? notification.senderDisplayName || "Người dùng"
                                : notification.displayName || notification.username || "Người dùng"}
                        </p>
                        <div className="flex items-center space-x-2">
                            {!isRead ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkRead(notification.id, notification);
                                    }}
                                    className="text-[var(--text-color)] hover:text-[var(--primary-color)]"
                                    title="Đánh dấu đã đọc"
                                >
                                    <FaCheckCircle />
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkUnread(notification.id);
                                    }}
                                    className="text-[var(--text-color)] hover:text-[var(--primary-color)]"
                                    title="Đánh dấu chưa đọc"
                                >
                                    <FaCircle />
                                </button>
                            )}
                            <button
                                className="text-[var(--text-color)] hover:text-[var(--primary-color)]"
                                title="Tùy chọn"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FaEllipsisH />
                            </button>
                        </div>
                    </div>

                    <div className="mt-1 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150">
                        {renderMessageWithLink()}
                        {notification.tags?.length > 0 && (
                            <p className="text-[var(--primary-color)] text-sm mb-1">
                                {notification.tags.map((tag, idx) => (
                                    <span key={idx} className="mr-2">
                   {tag}
                 </span>
                                ))}
                            </p>
                        )}
                        <p className="text-muted text-xs mt-2">
                            {notification.createdAt
                                ? moment(
                                    typeof notification.createdAt === "number"
                                        ? notification.createdAt * 1000
                                        : notification.createdAt
                                ).fromNow()
                                : "Thời gian không xác định"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotificationItem;
