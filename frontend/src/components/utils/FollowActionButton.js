import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function FollowActionButton({ targetId, disabled, onFollowChange }) {
  const { user } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.id === targetId) return;

    const fetchFollowStatus = async () => {
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token");

        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/follows/status/${targetId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
        );
        if (!response.ok) throw new Error("Không thể lấy trạng thái theo dõi");
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error("Lỗi khi lấy trạng thái theo dõi:", err);
      }
    };

    fetchFollowStatus();
  }, [user, targetId]);

  const handleAction = async (action) => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token");

      const response = await fetch(
          `${process.env.REACT_APP_API_URL}/follows/${targetId}`,
          {
            method: action === "follow" ? "POST" : "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
      );
      if (!response.ok) throw new Error(await response.text());
      const newIsFollowing = action === "follow";
      setIsFollowing(newIsFollowing);
      if (onFollowChange) onFollowChange(newIsFollowing);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === targetId) return null;

  return (
      <button
          onClick={() => handleAction(isFollowing ? "unfollow" : "follow")}
          disabled={loading || disabled}
          className={`
        rounded-full px-2 py-1 text-sm font-medium transition-colors duration-200 ml-1
        ${
              isFollowing
                  ? "border border-gray-500 text-gray-500 bg-white hover:bg-gray-200 dark:border-gray-400 dark:text-gray-400 dark:bg-black dark:hover:bg-gray-800"
                  : "border border-black text-black bg-white hover:bg-gray-200 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800"
          }
      `}
      >
        {loading ? "Đang xử lý..." : isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
      </button>
  );
}

export default FollowActionButton;