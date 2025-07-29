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

        {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
      </button>
  );
}

export default FollowActionButton;