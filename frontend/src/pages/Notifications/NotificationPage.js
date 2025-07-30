import React, { useState, useEffect, useContext } from "react";
import { FaCog } from "react-icons/fa";
import SidebarRight from "../../components/layout/SidebarRight/SidebarRight";
import { AuthContext } from "../../context/AuthContext";
import { WebSocketContext } from "../../context/WebSocketContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import { motion, AnimatePresence } from "framer-motion";

function NotificationPage({ onToggleDarkMode, isDarkMode, onShowCreatePost }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { subscribe, unsubscribe } = useContext(WebSocketContext);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            if (!token) {
                toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/notifications?page=0&size=100`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể lấy thông báo.");
            }

            const data = await response.json();
            const formattedNotifications = Array.isArray(data.data?.content)
                ? data.data.content
                    .filter((notif) => {
                        if (notif.targetType === "POST" && !notif.targetId) {
                            console.warn("Thông báo POST thiếu targetId:", notif);
                            return false;
                        }
                        return true;
                    })
                    .map((notif) => ({
                        id: notif.id,
                        type: notif.type,
                        userId: notif.userId || null,
                        displayName:
                            notif.targetType === "GROUP"
                                ? notif.groupName || "Nhóm"
                                : notif.displayName || "Người dùng",
                        username: notif.username || "unknown",
                        message: notif.message,
                        tags: notif.tags || [],
                        timestamp: notif.createdAt,
                        isRead: notif.status === "read",
                        image: notif.image || null,
                        targetId: notif.targetId,
                        targetType: notif.targetType || "PROFILE",
                    }))
                : [];

            formattedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setNotifications(formattedNotifications);
            setUnreadCount(formattedNotifications.filter((n) => !n.isRead).length);
        } catch (error) {
            console.error("Lỗi khi lấy thông báo:", error);
            toast.error(error.message || "Không thể lấy thông báo!");
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        try {
            await fetch(`${process.env.REACT_APP_API_URL}/notifications/mark-all-read`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
            window.dispatchEvent(
                new CustomEvent("updateUnreadNotificationCount", {
                    detail: { unreadCount: 0 },
                })
            );
        } catch (err) {
            console.error("Lỗi khi markAllAsRead:", err);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchNotifications().then(() => {
            window.dispatchEvent(
                new CustomEvent("updateUnreadNotificationCount", {
                    detail: { unreadCount: 0 },
                })
            );
        });
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
    }, [user]);
    
    useEffect(() => {
        if (!user || !subscribe || !unsubscribe) return;

        const subscription = subscribe(
            `/topic/notifications/${user.id}`,
            (notification) => {
                const newNotification = {
                    id: notification.id,
                    type: notification.type,
                    userId: user.id,
                    displayName:
                        notification.targetType === "GROUP"
                            ? notification.displayName || "Nhóm"
                            : notification.adminDisplayName || notification.displayName || "Người dùng",
                    username: notification.username || notification.adminDisplayName || "unknown",
                    message: notification.message,
                    tags: notification.tags || [],
                    timestamp: notification.createdAt * 1000,
                    isRead: notification.status === "read",
                    image: notification.image || null,
                    targetId: notification.targetId,
                    targetType: notification.targetType || "PROFILE",
                };

                if (newNotification.targetType === "POST" && !newNotification.targetId) {
                    console.warn("Thông báo POST qua WebSocket thiếu targetId:", newNotification);
                    return;
                }

                toast.info(notification.message, {
                    onClick: () => {
                        if (notification.type === "REPORT_STATUS_UPDATED" || notification.type === "REPORT_ABUSE_WARNING") {
                            navigate(`/profile/${notification.adminDisplayName || notification.username}`);
                        } else if (notification.targetType === "GROUP") {
                            if (!notification.targetId) {
                                toast.error("Không thể điều hướng: Thiếu ID nhóm.");
                                return;
                            }
                            navigate(`/community/${notification.targetId}`);
                        } else if (notification.targetType === "POST") {
                            if (!notification.targetId) {
                                toast.error("Không thể điều hướng: Thiếu ID bài đăng.");
                                return;
                            }
                            navigate(`/home?postId=${notification.targetId}`);
                        }
                    },
                });

                setNotifications((prev) => {
                    const filteredNotifications = prev.filter((n) => n.id !== newNotification.id);
                    const newList = [newNotification, ...filteredNotifications];
                    newList.sort((a, b) => b.timestamp - a.timestamp);
                    setUnreadCount(newList.filter((n) => !n.isRead).length);
                    return newList;
                });
            },
            `notifications-${user.id}`
        );

        return () => {
            if (subscription) unsubscribe(`notifications-${user.id}`);
        };
    }, [user, subscribe, unsubscribe, navigate]);

    const handleMarkRead = async (id, notification) => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            toast.error("Không tìm thấy token!");
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/notifications/${id}/mark-read`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể đánh dấu đã đọc!");
            }

            setNotifications((prev) =>
                prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
            );
            setUnreadCount((prev) => prev - 1);

            if (notification.targetType === "POST") {
                if (!notification.targetId) {
                    toast.error("Không thể điều hướng: Thiếu ID bài đăng.");
                    return;
                }
                navigate(`/home?postId=${notification.targetId}`);
            } else if (
                notification.targetType === "PROFILE" &&
                notification.username &&
                notification.username !== "unknown"
            ) {
                navigate(`/profile/${notification.username}`);
            } else if (notification.targetType === "GROUP") {
                if (!notification.targetId) {
                    toast.error("Không thể điều hướng: Thiếu ID nhóm.");
                    return;
                }
                navigate(`/community/${notification.targetId}`);
            }
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
            toast.error(error.message || "Không thể đánh dấu đã đọc!");
        }
    };

    const handleMarkUnread = async (id) => {
        const token = 
            sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            toast.error("Không tìm thấy token!");
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/notifications/${id}/mark-unread`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể đánh dấu chưa đọc!");
            }

            setNotifications((prev) =>
                prev.map((notif) => (notif.id === id ? { ...notif, isRead: false } : notif))
            );

            toast.success("Đã đánh dấu chưa đọc!");
            window.dispatchEvent(
                new CustomEvent("updateUnreadNotificationCount", {
                    detail: { unreadCount: unreadCount + 1 },
                })
            );
        } catch (error) {
            console.error("Lỗi khi đánh dấu chưa đọc:", error);
            toast.error(error.message || "Không thể đánh dấu chưa đọc!");
        }
    };

    const renderNotificationContent = () => {
        if (loading) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center py-10"
                >
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </motion.div>
            );
        }

        return notifications.length === 0 ? (
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-500 text-center p-6"
            >
                Không có thông báo nào.
            </motion.p>
        ) : (
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <NotificationItem
                            notification={notification}
                            handleMarkRead={handleMarkRead}
                            handleMarkUnread={handleMarkUnread}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        );
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDarkMode ? "dark" : "light"}
            />
            <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col flex-grow max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
                >
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 z-50">
                        <div className="px-6 flex justify-between items-center">
                            <h5 className="font-bold text-xl text-gray-900 dark:text-white">
                                Thông báo
                                {unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h5>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                    disabled={unreadCount === 0}
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                                <button
                                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                    title="Cài đặt"
                                >
                                    <FaCog className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        {renderNotificationContent()}
                    </div>
                </motion.div>

                <div className="hidden lg:block w-[350px] ml-4">
                    <SidebarRight />
                </div>
            </div>
        </>
    );
}

export default NotificationPage;