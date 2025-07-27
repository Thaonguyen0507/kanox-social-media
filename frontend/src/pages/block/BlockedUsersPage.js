import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, ListGroup, Spinner } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import SidebarRight from "../../components/layout/SidebarRight/SidebarRight";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BlockedUserItem from "./BlockedUserItem";
import { useSpring, animated } from "react-spring";

function BlockedUsersPage() {
    const { user } = useContext(AuthContext);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Animation cho loading spinner
    const loadingAnimation = useSpring({
        from: { opacity: 0, transform: "scale(0.8)" },
        to: { opacity: loading ? 1 : 0, transform: loading ? "scale(1)" : "scale(0.8)" },
        config: { tension: 220, friction: 20 },
    });

    // Animation cho danh sách khi load
    const listAnimation = useSpring({
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: blockedUsers.length > 0 ? 1 : 0, transform: "translateY(0)" },
        config: { tension: 180, friction: 12 },
    });

    useEffect(() => {
        fetchBlockedUsers();
    }, [user]);

    const fetchBlockedUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            toast.error("Không tìm thấy token! Vui lòng đăng nhập lại!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/blocks`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
                console.log("API Response:", data);
            } else {
                const text = await response.text();
                data = { message: text };
                console.log("API Text Response:", text);
            }

            if (!response.ok) {
                throw new Error(data.message || "Không thể lấy danh sách người bị chặn!");
            }

            setBlockedUsers(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách:", error);
            toast.error(error.message || "Không thể tải danh sách!");
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (blockedUserId) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/blocks/${blockedUserId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text };
            }

            if (!response.ok) {
                throw new Error(data.message || "Không thể bỏ chặn!");
            }

            toast.success("Bỏ chặn thành công!");
            fetchBlockedUsers();
        } catch (error) {
            console.error("Lỗi khi bỏ chặn:", error);
            toast.error(error.message || "Lỗi khi bỏ chặn!");
        }
    };

    const handleToggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
        document.body.classList.toggle("dark-mode", !isDarkMode);
    };

    const handleShowCreatePost = () => {
        console.log("Mở modal tạo bài đăng");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[var(--background-color)]">
                <animated.div style={loadingAnimation}>
                    <Spinner animation="border" role="status" className="text-[var(--primary-color)]" />
                </animated.div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer position="top-center" autoClose={3000} />
            <Container fluid className="min-h-screen bg-[var(--background-color)] p-0">
                <div className="sticky top-0 bg-[var(--background-color)] py-3 border-b border-[var(--border-color)] shadow-sm z-50">
                    <Container fluid>
                        <Row className="align-items-center">
                            <Col xs={12} className="px-4">
                                <div className="flex items-center gap-4">
                                    <Link to="/profile" className="btn btn-light rounded-full p-2 hover:bg-gray-100 transition-colors duration-200">
                                        <FaArrowLeft size={20} />
                                    </Link>
                                    <div>
                                        <h5 className="mb-0 fw-bold text-[var(--text-color)]">Người bị chặn</h5>
                                        <span className="text-[var(--text-color-muted)] text-sm">Quản lý danh sách chặn</span>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

                <Container fluid className="flex-grow">
                    <Row className="h-100">
                        <Col xs={12} lg={8} className="px-4 py-3">
                            <h4 className="text-[var(--text-color)] mb-4">Danh sách người bị chặn</h4>
                            <animated.div style={listAnimation}>
                                <ListGroup variant="flush" className="rounded-lg">
                                    {blockedUsers.length === 0 ? (
                                        <p className="text-[var(--text-color-muted)] text-center p-4">Chưa chặn ai cả.</p>
                                    ) : (
                                        blockedUsers.map((blockedUser) => (
                                            <BlockedUserItem
                                                key={blockedUser.id}
                                                blockedUser={blockedUser}
                                                handleUnblock={handleUnblock}
                                            />
                                        ))
                                    )}
                                </ListGroup>
                            </animated.div>
                        </Col>
                        <Col xs={0} lg={4} className="d-none d-lg-block p-0">
                            <SidebarRight />
                        </Col>
                    </Row>
                </Container>
            </Container>
        </>
    );
}

export default BlockedUsersPage;