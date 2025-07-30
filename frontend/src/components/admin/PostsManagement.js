import React, { useState, useEffect } from "react";

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // page index từ 0
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 5; // số bài mỗi trang
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const fetchPosts = async (page = 0) => {
    setLoading(true);
    try {
      const response = await fetch(
          `${API_URL}/posts/newsfeed?page=${page}&size=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Lỗi khi lấy bài viết");

      // API backend nên trả về dạng { content, totalPages }
      setPosts(result.content || result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error("Lỗi khi load bài viết:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Đang tải dữ liệu bài viết...</div>;
  }

  return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Quản lý Bài viết
        </h2>

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
            {posts.length > 0 ? (
                posts.map((post) => (
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
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Không có bài viết nào.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-600">
          Trang {currentPage + 1} / {totalPages}
        </span>
          <div className="flex space-x-3">
            <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-lg text-white ${
                    currentPage === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              Trước
            </button>
            <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className={`px-4 py-2 rounded-lg text-white ${
                    currentPage === totalPages - 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
  );
};

export default PostsManagement;
