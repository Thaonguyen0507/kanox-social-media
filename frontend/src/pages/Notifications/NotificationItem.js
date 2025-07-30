import React from "react";
import { FaCheckCircle, FaCircle, FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

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

        if (notification.targetType === "GROUP" && displayName && message.includes(displayName)) {
            const parts = message.split(displayName);
            return (
                <p className="mb-1 text-gray-700 dark:text-gray-300">
                    {parts[0]}
                    <span
                        className="font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                        onClick={() => navigate(`/community/${notification.targetId}`)}
                    >
                        {displayName}
                    </span>
                    {parts[1]}
                </p>
            );
        }

        return (
            <p className="mb-1 text-gray-700 dark:text-gray-300">
                {message.replace("{displayName}", displayName)}
            </p>
        );
    };

    const renderAvatar = () => (
        <img
            src={notification.image || "https://placehold.co/40x40?text=Avatar"}
            alt={`Avatar của ${notification.displayName || "Người dùng"}`}
            className={`w-12 h-12 object-cover mr-4 ${
                notification.targetType === "GROUP" ? "rounded-md" : "rounded-full"
            } border border-gray-200 dark:border-gray-700`}
        />
    );

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                !isRead ? "bg-blue-50 dark:bg-gray-700" : "bg-white dark:bg-gray-800"
            } transition-colors duration-200 cursor-pointer`}
            onClick={handleNotificationClick}
        >
            <div className="flex items-start">
                {renderAvatar()}
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                        <p
                            className="font-semibold text-blue-600 dark:text-blue-400 cursor-pointer m-0 hover:underline"
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
                            {notification.displayName || notification.username || "Người dùng"}
                        </p>
                        <div className="flex items-center space-x-3">
                            {!isRead ? (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkRead(notification.id, notification);
                                    }}
                                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    title="Đánh dấu đã đọc"
                                >
                                    <FaCheckCircle className="w-4 h-4" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkUnread(notification.id);
                                    }}
                                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    title="Đánh dấu chưa đọc"
                                >
                                    <FaCircle className="w-4 h-4" />
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                title="Tùy chọn"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FaEllipsisH className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150">
                        {renderMessageWithLink()}
                        {notification.tags?.length > 0 && (
                            <p className="text-blue-500 dark:text-blue-400 text-sm mb-2">
                                {notification.tags.map((tag, idx) => (
                                    <span key={idx} className="mr-2 inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </p>
                        )}
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
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
        </motion.div>
    );
}

export default NotificationItem;