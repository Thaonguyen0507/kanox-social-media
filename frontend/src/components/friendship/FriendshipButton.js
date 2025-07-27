import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function FriendshipButton({ targetId, disabled, onAction }) {
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

      if (!response.ok) throw new Error("Hành động thất bại");
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
        rounded-full px-2 py-1 text-sm font-medium transition-colors duration-200
        ${
              status === "accepted"
                  ? "border border-black text-black bg-white hover:bg-gray-200 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800"
                  : status === "pendingSent"
                      ? "border border-gray-500 text-gray-500 bg-white hover:bg-gray-200 dark:border-gray-400 dark:text-gray-400 dark:bg-black dark:hover:bg-gray-800"
                      : status === "pendingReceived"
                          ? "border border-black text-black bg-white hover:bg-gray-200 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800"
                          : "border border-black text-black bg-white hover:bg-gray-200 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800"
          }
      `}
      >
        {status === "none" && "Kết bạn"}
        {status === "pendingSent" && "Đã gửi"}
        {status === "pendingReceived" && "Chấp nhận"}
        {status === "accepted" && "Hủy kết bạn"}
      </button>
  );
}

export default FriendshipButton;