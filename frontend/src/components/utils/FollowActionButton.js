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

        const res = await fetch(
            `${process.env.REACT_APP_API_URL}/follows/status/${targetId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
        );
        if (!res.ok) throw new Error("Không thể lấy trạng thái theo dõi");
        const data = await res.json();
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

      const res = await fetch(`${process.env.REACT_APP_API_URL}/follows/${targetId}`, {
        method: action === "follow" ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(await res.text());
      const newStatus = action === "follow";
      setIsFollowing(newStatus);
      if (onFollowChange) onFollowChange(newStatus);
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
        group inline-flex items-center justify-center 
        border rounded-full px-3 py-1 text-sm font-medium 
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30
        ${
              isFollowing
                  ? "border-gray-500 text-gray-700 hover:bg-gray-100 dark:border-gray-400 dark:text-gray-300 dark:hover:bg-gray-800"
                  : "border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
      >
        {loading ? "Đang xử lý..." : isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
      </button>
  );
}

export default FollowActionButton;