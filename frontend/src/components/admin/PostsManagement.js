import React, { useState, useEffect } from "react";

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL; // ví dụ: http://localhost:8080/api
  const token = localStorage.getItem("token");

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
        ? "--"
        : d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      console.log("=== DEBUG fetchPosts ===");
      console.log("API_URL:", API_URL);
      console.log("Token:", token);

      if (!API_URL) {
        setError("API_URL không được định nghĩa. Kiểm tra file .env");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Không có token trong localStorage");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/posts/newsfeed`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Fetch status:", response.status);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const result = await response.json();
        console.log("API result:", result);

        setPosts(result.data || []);
      } catch (err) {
        console.error("Lỗi khi load bài viết:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="p-6">Đang tải dữ liệu bài viết...</div>;

  if (error)
    return (
        <div className="p-6 text-red-600">
          Lỗi: {error}
          <br />
          Xem chi tiết trong console (F12)
        </div>
    );

  return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Bài viết</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">
                ID
              </th>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">
                Tác giả
              </th>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">
                Nội dung
              </th>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">
                Ngày đăng
              </th>
            </tr>
            </thead>
            <tbody>
            {posts.map((post) => (
                <tr
                    key={post.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-800">{post.id}</td>
                  <td className="py-3 px-4 text-gray-800">
                    {post.owner?.displayName || post.owner?.username}
                  </td>
                  <td className="py-3 px-4 text-gray-800 truncate max-w-xs">
                    {post.content}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {formatDate(post.createdAt)}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default PostsManagement;
