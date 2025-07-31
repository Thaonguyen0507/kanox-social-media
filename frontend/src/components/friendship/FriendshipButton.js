import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify"; // Thêm import toast

function FriendshipButton({ targetId, disabled, onAction, onFollowAction, setIsFollowing }) {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.id === targetId) return;

    const fetchStatus = async () => {
      try {
        const token =
            sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token");

        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/friends/status/${targetId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
        );
        if (!response.ok) throw new Error("Không thể lấy trạng thái bạn bè");
        const data = await response.json();
        setStatus(data.status || "none");
      } catch (err) {
        console.error("Lỗi khi lấy trạng thái bạn bè:", err);
      }
    };

    fetchStatus();
  }, [user, targetId]);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token");

      let url, method;
      if (action === "send") {
        url = `${process.env.REACT_APP_API_URL}/friends/request/${targetId}`;
        method = "POST";
      } else if (action === "accept") {
        url = `${process.env.REACT_APP_API_URL}/friends/accept/${targetId}`;
        method = "PUT";
      } else if (action === "reject") {
        url = `${process.env.REACT_APP_API_URL}/friends/reject/${targetId}`;
        method = "PUT";
      } else if (action === "cancel") {
        url = `${process.env.REACT_APP_API_URL}/friends/${targetId}`;
        method = "DELETE";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Hành động kết bạn thất bại");

      if (action === "send" && onFollowAction) {
        await onFollowAction(); // Gọi hàm theo dõi
        setIsFollowing(true); // Cập nhật trạng thái theo dõi
      }

      setStatus(
          action === "send"
              ? "pendingSent"
              : action === "accept"
                  ? "accepted"
                  : action === "reject" || action === "cancel"
                      ? "none"
                      : status
      );
      if (onAction) onAction();
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Lỗi: " + err.message); // Sử dụng toast đã import
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === targetId) return null;

  return (
      <button
          onClick={() =>
              handleAction(
                  status === "none"
                      ? "send"
                      : status === "pendingReceived"
                          ? "accept"
                          : status === "pendingSent" || status === "accepted"
                              ? "cancel"
                              : "reject"
              )
          }
          disabled={loading || disabled}
          className={`
        inline-flex items-center justify-center px-4 py-2 rounded-full border
        font-medium text-sm transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]
        bg-white text-black border-gray-300 dark:bg-gray-900 dark:text-white dark:border-gray-600
      `}
      >
        {loading ? (
            <svg
                className="animate-spin h-4 w-4 mr-2 text-gray-500 dark:text-gray-300"
                viewBox="0 0 24 24"
            >
              <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
              />
              <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
        ) : null}

        {status === "none" && "Kết bạn"}
        {status === "pendingSent" && "Đã gửi"}
        {status === "pendingReceived" && "Chấp nhận"}
        {status === "accepted" && "Hủy kết bạn"}
      </button>
  );
}

export default FriendshipButton;