// src/pages/PostDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const formatDate = (timestamp) => {
        if (!timestamp) return "--";
        const millis = Number(timestamp) * 1000;
        const d = new Date(millis);
        if (isNaN(d.getTime())) return "--";
        return d.toLocaleString("vi-VN");
    };

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const res = await fetch(`${API_URL}/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }

                const result = await res.json();
                setPost(result.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPostDetail();
    }, [API_URL, id, token]);

    if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;
    if (!post) return <div className="p-6">Đang tải chi tiết bài viết...</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Chi tiết Bài viết</h2>
            <p><strong>ID:</strong> {post.id}</p>
            <p><strong>Tác giả:</strong> {post.owner?.displayName || post.owner?.username}</p>
            <p><strong>Nội dung:</strong> {post.content}</p>
            <p><strong>Ngày đăng:</strong> {formatDate(post.createdAt)}</p>
            <p><strong>Số lượt thích:</strong> {post.likeCount}</p>
            <p><strong>Số bình luận:</strong> {post.commentCount}</p>
            <p><strong>Riêng tư:</strong> {post.privacySetting}</p>

            {post.groupName && (
                <p><strong>Nhóm:</strong> {post.groupName} ({post.groupPrivacyLevel})</p>
            )}

            <p className="mt-4">
                <Link to="/posts" className="text-blue-500 hover:underline">← Quay lại danh sách</Link>
            </p>
        </div>
    );
};

export default PostDetail;
