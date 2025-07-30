import React, { useState, useEffect } from "react";

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL; // ví dụ: http://localhost:8080/api/posts
  const token = localStorage.getItem("token"); // hoặc sessionStorage

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/newsfeed`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Lỗi khi lấy bài viết");

        // Lấy danh sách bài viết từ result.data
        setPosts(result.data || []);
      } catch (err) {
        console.error("Lỗi khi load bài viết:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu bài viết...</div>;
  }

  return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Quản lý Bài viết
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">ID</th>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">Tác giả</th>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">Nội dung</th>
              <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold text-sm">Ngày đăng</th>
            </tr>
            </thead>
            <tbody>
            {posts.map((post) => (
                <tr
                    key={post.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-800">{post.id}</td>
                  <td className="py-3 px-4 text-gray-800">{post.owner.displayName || post.owner.username}</td>
                  <td className="py-3 px-4 text-gray-800 truncate max-w-xs">{post.content}</td>
                  <td className="py-3 px-4 text-gray-800">
                    {new Date(post.createdAt).toLocaleDateString()}
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
