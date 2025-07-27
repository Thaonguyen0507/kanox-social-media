import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import {
    Modal,
    Form,
    Button,
    FormControl,
    FormGroup,
    FormLabel,
    Row,
    Col,
    Image as BootstrapImage,
} from "react-bootstrap";
import {
    FaGlobeAmericas,
    FaUserFriends,
    FaLock,
    FaList,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSpring, animated } from "react-spring";

function EditPostModal({ show, onHide, post, onSave }) {
    const { user, token } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        content: "",
        privacySetting: "public",
        taggedUserIds: [],
        tagInput: "",
        customListId: null,
        images: [],
        existingImageUrls: [],
        imagesToDelete: [],
    });
    const [customLists, setCustomLists] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCustomList, setShowCustomList] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchCustomLists = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/privacy/lists`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Không thể lấy danh sách tùy chỉnh!");
                const { data } = await response.json();
                setCustomLists(data);
            } catch (err) {
                console.error("Lỗi lấy danh sách:", err);
                toast.error(err.message);
            }
        };
        if (token) fetchCustomLists();
    }, [token]);

    useEffect(() => {
        if (post) {
            setFormData({
                content: post.content || "",
                privacySetting: post.privacySetting === "private" ? "only_me" : post.privacySetting || "public",
                taggedUserIds: post.taggedUsers ? post.taggedUsers.map((tag) => parseInt(tag.id)) : [],
                tagInput: "",
                customListId: post.customListId || null,
                images: [],
                existingImageUrls: post.imageUrls || [],
                imagesToDelete: [],
            });
        }
    }, [post]);

    const handleStatusChange = useCallback(
        async (newStatus) => {
            try {
                if (!token) throw new Error("Vui lòng đăng nhập để cập nhật trạng thái!");
                const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${post.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        content: formData.content,
                        privacySetting: newStatus,
                        taggedUserIds: formData.taggedUserIds,
                        customListId: newStatus === "custom" ? formData.customListId : null,
                    }),
                });
                if (!response.ok) throw new Error("Không thể cập nhật trạng thái!");
                toast.success("Cập nhật trạng thái thành công!");
                setFormData((prev) => ({
                    ...prev,
                    privacySetting: newStatus,
                    customListId: newStatus !== "custom" ? null : prev.customListId,
                }));
                if (onSave) onSave();
            } catch (err) {
                toast.error(err.message);
            }
        },
        [token, post?.id, formData.content, formData.taggedUserIds, formData.customListId, onSave]
    );

    const handleCustomListSelect = useCallback(
        async (listId) => {
            try {
                if (!token) throw new Error("Vui lòng đăng nhập để cập nhật danh sách tùy chỉnh!");
                const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${post.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        content: formData.content,
                        privacySetting: "custom",
                        taggedUserIds: formData.taggedUserIds,
                        customListId: listId,
                    }),
                });
                if (!response.ok) throw new Error("Không thể cập nhật danh sách tùy chỉnh!");
                toast.success("Cập nhật danh sách tùy chỉnh thành công!");
                setFormData((prev) => ({ ...prev, customListId: listId }));
                setShowCustomList(false);
                if (onSave) onSave();
            } catch (err) {
                toast.error(err.message);
            }
        },
        [token, post?.id, formData.content, formData.taggedUserIds, onSave]
    );

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleTagInputChange = useCallback((e) => {
        setFormData((prev) => ({ ...prev, tagInput: e.target.value }));
    }, []);

    const handleAddTag = useCallback(async () => {
        const username = formData.tagInput.trim();
        if (username && !formData.taggedUserIds.includes(username)) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/username/${username}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Không tìm thấy người dùng!");
                const data = await response.json();
                setFormData((prev) => ({
                    ...prev,
                    taggedUserIds: [...prev.taggedUserIds, parseInt(data.id)],
                    tagInput: "",
                }));
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            }
        }
    }, [formData.tagInput, formData.taggedUserIds, token]);

    const handleRemoveTag = useCallback((tagId) => {
        setFormData((prev) => ({
            ...prev,
            taggedUserIds: prev.taggedUserIds.filter((id) => id !== tagId),
        }));
    }, []);

    const handleImageUpload = useCallback((e) => {
        const files = Array.from(e.target.files);
        const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
        const maxSize = 5 * 1024 * 1024;

        const validFiles = files.filter((file) => validImageTypes.includes(file.type) && file.size <= maxSize);

        if (validFiles.length < files.length) {
            setError("Một số file không hợp lệ (chỉ hỗ trợ JPEG, PNG, GIF, tối đa 5MB)");
            toast.error("Một số file không hợp lệ (chỉ hỗ trợ JPEG, PNG, GIF, tối đa 5MB)");
        }

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...validFiles],
        }));
    }, []);

    const handleRemoveImage = useCallback((index, isExisting = false) => {
        if (isExisting) {
            const imageUrl = formData.existingImageUrls[index];
            const imageId = imageUrl.split("/").pop();
            setFormData((prev) => ({
                ...prev,
                existingImageUrls: prev.existingImageUrls.filter((_, i) => i !== index),
                imagesToDelete: [...prev.imagesToDelete, imageId],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index),
            }));
        }
    }, [formData.existingImageUrls]);

    const handleOpenMediaModal = useCallback((index) => {
        setCurrentMediaIndex(index);
        setShowMediaModal(true);
    }, []);

    const handleCloseMediaModal = useCallback(() => {
        setShowMediaModal(false);
    }, []);

    const handleNextMedia = useCallback(() => {
        const totalMedia = [...formData.existingImageUrls, ...formData.images];
        setCurrentMediaIndex((prev) => (prev === totalMedia.length - 1 ? 0 : prev + 1));
    }, [formData.existingImageUrls, formData.images]);

    const handlePrevMedia = useCallback(() => {
        const totalMedia = [...formData.existingImageUrls, ...formData.images];
        setCurrentMediaIndex((prev) => (prev === 0 ? totalMedia.length - 1 : prev - 1));
    }, [formData.existingImageUrls, formData.images]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            if (!formData.content.trim()) {
                setError("Nội dung không được để trống!");
                toast.error("Nội dung không được để trống!");
                setLoading(false);
                return;
            }
            if (formData.privacySetting === "custom" && !formData.customListId) {
                setError("Vui lòng chọn danh sách tùy chỉnh!");
                toast.error("Vui lòng chọn danh sách tùy chỉnh!");
                setLoading(false);
                return;
            }

            try {
                const formDataToSend = new FormData();
                formDataToSend.append("content", formData.content);
                formDataToSend.append("privacySetting", formData.privacySetting);
                formDataToSend.append("taggedUserIds", JSON.stringify(formData.taggedUserIds));
                if (formData.customListId) {
                    formDataToSend.append("customListId", formData.customListId);
                }
                if (formData.imagesToDelete.length > 0) {
                    formDataToSend.append("imagesToDelete", JSON.stringify(formData.imagesToDelete));
                }
                formData.images.forEach((image, index) => {
                    formDataToSend.append(`images[${index}]`, image);
                });

                const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${post.id}`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formDataToSend,
                });

                const text = await response.text();
                if (!response.ok) {
                    let errData;
                    try {
                        errData = JSON.parse(text);
                    } catch {
                        throw new Error(`Lỗi server: ${response.status} - ${text || "Không rõ lỗi"}`);
                    }
                    throw new Error(errData.message || "Không thể cập nhật bài đăng!");
                }

                toast.success("Cập nhật bài đăng thành công!");
                if (onSave) onSave();
                onHide();
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        },
        [formData, token, post?.id, onSave, onHide]
    );

    const renderStatusIcon = (status) => {
        switch (status) {
            case "public":
                return <FaGlobeAmericas className="me-1 text-primary" />;
            case "friends":
                return <FaUserFriends className="me-1 text-success" />;
            case "only_me":
                return <FaLock className="me-1 text-danger" />;
            case "custom":
                return <FaList className="me-1 text-info" />;
            default:
                return <FaGlobeAmericas className="me-1 text-primary" />;
        }
    };

    const renderStatusText = (status) => {
        switch (status) {
            case "public":
                return "Công khai";
            case "friends":
                return "Bạn bè";
            case "only_me":
                return "Chỉ mình tôi";
            case "custom":
                return "Tùy chỉnh";
            default:
                return "Công khai";
        }
    };

    const renderMediaPreview = () => {
        const allMedia = [
            ...formData.existingImageUrls.map((url) => ({ url, type: "image", isExisting: true })),
            ...formData.images.map((file) => ({ url: URL.createObjectURL(file), type: file.type, isExisting: false })),
        ];

        if (allMedia.length === 0) return null;

        const filesToShow = allMedia.slice(0, 4);
        const extraCount = allMedia.length - 4;

        if (allMedia.length === 1) {
            return (
                <div className="overflow-hidden rounded-2xl mb-4 relative">
                    <BootstrapImage
                        src={allMedia[0].url}
                        className="w-full h-auto max-h-[500px] object-cover block cursor-pointer rounded-2xl"
                        fluid
                        onClick={() => handleOpenMediaModal(0)}
                    />
                    <button
                        className="absolute top-2 right-2 text-black bg-white/80 rounded-full w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:bg-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(0, allMedia[0].isExisting);
                        }}
                    >
                        <AiOutlineClose size={18} />
                    </button>
                </div>
            );
        }

        if (allMedia.length === 2) {
            return (
                <Row className="overflow-hidden rounded-2xl g-2 mb-4">
                    {filesToShow.map((preview, idx) => (
                        <Col key={idx} xs={6} className="relative">
                            <BootstrapImage
                                src={preview.url}
                                className="w-full h-[300px] object-cover rounded-2xl cursor-pointer"
                                fluid
                                onClick={() => handleOpenMediaModal(idx)}
                            />
                            <button
                                className="absolute top-2 right-2 text-black bg-white/80 rounded-full w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:bg-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(idx, preview.isExisting);
                                }}
                            >
                                <AiOutlineClose size={18} />
                            </button>
                        </Col>
                    ))}
                </Row>
            );
        }

        if (allMedia.length === 3) {
            return (
                <Row className="overflow-hidden rounded-2xl g-2 mb-4">
                    <Col xs={6} className="relative">
                        <BootstrapImage
                            src={filesToShow[0].url}
                            className="w-full h-[400px] object-cover rounded-2xl cursor-pointer"
                            fluid
                            onClick={() => handleOpenMediaModal(0)}
                        />
                        <button
                            className="absolute top-2 right-2 text-black bg-white/80 rounded-full w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:bg-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(0, filesToShow[0].isExisting);
                            }}
                        >
                            <AiOutlineClose size={18} />
                        </button>
                    </Col>
                    <Col xs={6}>
                        <div className="flex flex-col h-full g-1">
                            <div className="relative mb-1">
                                <BootstrapImage
                                    src={filesToShow[1].url}
                                    className="w-full h-[198px] object-cover rounded-2xl cursor-pointer"
                                    fluid
                                    onClick={() => handleOpenMediaModal(1)}
                                />
                                <button
                                    className="absolute top-2 right-2 text-black bg-white/80 rounded-full w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:bg-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage(1, filesToShow[1].isExisting);
                                    }}
                                >
                                    <AiOutlineClose size={18} />
                                </button>
                            </div>
                            <div className="relative">
                                <BootstrapImage
                                    src={filesToShow[2].url}
                                    className="w-full h-[198px] object-cover rounded-2xl cursor-pointer"
                                    fluid
                                    onClick={() => handleOpenMediaModal(2)}
                                />
                                <button
                                    className="absolute top-2 right-2 text-black bg-white/80 rounded-full w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:bg-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage(2, filesToShow[2].isExisting);
                                    }}
                                >
                                    <AiOutlineClose size={18} />
                                </button>
                            </div>
                        </div>
                    </Col>
                </Row>
            );
        }

        return (
            <Row className="overflow-hidden rounded-2xl g-2 mb-4">
                {filesToShow.map((preview, idx) => (
                    <Col key={idx} xs={6} className="relative">
                        <BootstrapImage
                            src={preview.url}
                            className="w-full h-[200px] object-cover rounded-2xl cursor-pointer"
                            fluid
                            onClick={() => handleOpenMediaModal(idx)}
                        />
                        <button
                            className="absolute top-2 right-2 text-black bg-white/80 rounded-full w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:bg-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx, preview.isExisting);
                            }}
                        >
                            <AiOutlineClose size={18} />
                        </button>
                        {idx === 3 && extraCount > 0 && (
                            <div
                                className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center text-white text-2xl font-bold rounded-2xl cursor-pointer"
                                onClick={() => handleOpenMediaModal(3)}
                            >
                                +{extraCount}
                            </div>
                        )}
                    </Col>
                ))}
            </Row>
        );
    };

    const modalAnimation = useSpring({
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        config: { tension: 220, friction: 20 },
    });

    const mediaModalAnimation = useSpring({
        opacity: showMediaModal ? 1 : 0,
        transform: showMediaModal ? "scale(1)" : "scale(0.9)",
        config: { tension: 220, friction: 20 },
    });

    return (
        <>
            <animated.div style={modalAnimation}>
                <Modal show={show} onHide={onHide} centered className="text-[var(--text-color)]">
                    <Modal.Header className="bg-[var(--background-color)] border-[var(--border-color)]">
                        <Modal.Title>Chỉnh sửa bài đăng</Modal.Title>
                        <Button variant="link" onClick={onHide} className="text-[var(--text-color)]">
                            <AiOutlineClose size={20} />
                        </Button>
                    </Modal.Header>
                    <Modal.Body className="bg-[var(--background-color)] p-4">
                        <Form onSubmit={handleSubmit}>
                            <FormGroup className="mb-4">
                                <FormLabel className="text-[var(--text-color)]">Nội dung</FormLabel>
                                <FormControl
                                    as="textarea"
                                    rows={4}
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Bạn đang nghĩ gì?"
                                    className="bg-[var(--hover-bg-color)] text-[var(--text-color)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                                />
                            </FormGroup>

                            <FormGroup className="mb-4">
                                <FormLabel className="text-[var(--text-color)]">Trạng thái hiển thị</FormLabel>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowCustomList(!showCustomList)}
                                        className="rounded-full border border-[var(--border-color)] px-3 py-2 flex items-center gap-2 text-[var(--text-color)] bg-transparent hover:bg-[var(--hover-bg-color)] w-full transition-colors duration-200"
                                    >
                                        {renderStatusIcon(formData.privacySetting)}
                                        {renderStatusText(formData.privacySetting)}
                                    </button>
                                    {showCustomList && (
                                        <div className="absolute left-0 mt-1 w-full bg-[var(--background-color)] border border-[var(--border-color)] rounded shadow-lg z-50">
                                            <button
                                                onClick={() => {
                                                    handleStatusChange("public");
                                                    setShowCustomList(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-[var(--hover-bg-color)] flex items-center gap-2 text-[var(--text-color)] transition-colors duration-200"
                                            >
                                                <FaGlobeAmericas className="text-primary" /> Công khai
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleStatusChange("friends");
                                                    setShowCustomList(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-[var(--hover-bg-color)] flex items-center gap-2 text-[var(--text-color)] transition-colors duration-200"
                                            >
                                                <FaUserFriends className="text-success" /> Bạn bè
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleStatusChange("only_me");
                                                    setShowCustomList(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-[var(--hover-bg-color)] flex items-center gap-2 text-[var(--text-color)] transition-colors duration-200"
                                            >
                                                <FaLock className="text-danger" /> Chỉ mình tôi
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleStatusChange("custom");
                                                    setShowCustomList(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-[var(--hover-bg-color)] flex items-center gap-2 text-[var(--text-color)] transition-colors duration-200"
                                            >
                                                <FaList className="text-info" /> Tùy chỉnh
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </FormGroup>

                            {formData.privacySetting === "custom" && (
                                <FormGroup className="mb-4">
                                    <FormLabel className="text-[var(--text-color)]">Danh sách tùy chỉnh</FormLabel>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowCustomList(!showCustomList)}
                                            className="w-full text-left rounded-full border border-[var(--border-color)] px-3 py-2 text-[var(--text-color)] bg-[var(--hover-bg-color)] hover:bg-[var(--hover-bg-color-dark)] transition-colors duration-200"
                                        >
                                            {formData.customListId
                                                ? customLists.find((l) => l.id === formData.customListId)?.listName
                                                : "Chọn danh sách tùy chỉnh"}
                                        </button>
                                        {showCustomList && (
                                            <div className="absolute z-50 mt-1 bg-[var(--background-color)] border border-[var(--border-color)] rounded shadow-lg w-full">
                                                {customLists.map((list) => (
                                                    <button
                                                        key={list.id}
                                                        onClick={() => {
                                                            handleCustomListSelect(list.id);
                                                            setShowCustomList(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-[var(--hover-bg-color)] text-[var(--text-color)] transition-colors duration-200"
                                                    >
                                                        {list.listName}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormGroup>
                            )}

                            <FormGroup className="mb-4">
                                <FormLabel className="text-[var(--text-color)]">Tag người dùng</FormLabel>
                                <Row className="g-2">
                                    <Col xs={9}>
                                        <FormControl
                                            type="text"
                                            placeholder="Nhập username"
                                            value={formData.tagInput}
                                            onChange={handleTagInputChange}
                                            className="bg-[var(--hover-bg-color)] text-[var(--text-color)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                                        />
                                    </Col>
                                    <Col xs={3}>
                                        <Button
                                            variant="primary"
                                            onClick={handleAddTag}
                                            disabled={!formData.tagInput.trim()}
                                            className="w-full rounded-lg"
                                        >
                                            Thêm
                                        </Button>
                                    </Col>
                                </Row>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.taggedUserIds.map((tagId) => (
                                        <span
                                            key={tagId}
                                            className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full flex items-center"
                                        >
                      @User_{tagId}
                                            <Button
                                                variant="link"
                                                className="text-white p-0 ml-1"
                                                onClick={() => handleRemoveTag(tagId)}
                                            >
                        ×
                      </Button>
                    </span>
                                    ))}
                                </div>
                            </FormGroup>

                            <FormGroup className="mb-4">
                                <FormLabel className="text-[var(--text-color)]">Ảnh</FormLabel>
                                <FormControl
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={handleImageUpload}
                                    className="bg-[var(--hover-bg-color)] text-[var(--text-color)] border border-[var(--border-color)] rounded-lg"
                                />
                                <div className="mt-3">{renderMediaPreview()}</div>
                            </FormGroup>

                            {error && <p className="text-danger text-center">{error}</p>}

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={onHide}
                                    className="rounded-lg"
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading || (formData.privacySetting === "custom" && !formData.customListId)}
                                    className="rounded-lg"
                                >
                                    {loading ? "Đang lưu..." : "Lưu"}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </animated.div>

            <animated.div style={mediaModalAnimation}>
                {showMediaModal && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                        <div className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl">
                            <button
                                onClick={handleCloseMediaModal}
                                className="absolute top-4 right-4 text-black bg-white/80 rounded-full w-10 h-10 flex items-center justify-center transition-opacity duration-200 hover:bg-white z-50"
                            >
                                <AiOutlineClose size={20} />
                            </button>
                            <button
                                onClick={handlePrevMedia}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-black bg-white/80 rounded-full w-10 h-10 flex items-center justify-center transition-opacity duration-200 hover:bg-white z-50"
                            >
                                <FaChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleNextMedia}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black bg-white/80 rounded-full w-10 h-10 flex items-center justify-center transition-opacity duration-200 hover:bg-white z-50"
                            >
                                <FaChevronRight size={20} />
                            </button>
                            <BootstrapImage
                                src={
                                    currentMediaIndex < formData.existingImageUrls.length
                                        ? formData.existingImageUrls[currentMediaIndex]
                                        : URL.createObjectURL(formData.images[currentMediaIndex - formData.existingImageUrls.length])
                                }
                                alt="media"
                                className="w-full max-h-[80vh] object-contain rounded-2xl"
                                fluid
                            />
                        </div>
                    </div>
                )}
            </animated.div>
        </>
    );
}

export default EditPostModal;