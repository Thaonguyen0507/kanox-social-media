import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Form, Button, Spinner, Modal } from "react-bootstrap";
import { FaArrowLeft, FaLock, FaList, FaEyeSlash, FaKey } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SettingsPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        postVisibility: "public",
        commentPermission: "public",
        profileViewer: "public",
        customListId: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [verifyCode, setVerifyCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailForm, setEmailForm] = useState({ email: "", sending: false });
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const submitChangePassword = async () => {
        setChangingPassword(true);
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(passwordForm),
            });

            const data = await res.text(); // backend trả string
            if (!res.ok) throw new Error(data);
            toast.success("Đổi mật khẩu thành công");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.message || "Lỗi khi đổi mật khẩu");
        } finally {
            setChangingPassword(false);
        }
    };

    const submitSendVerifyEmail = async () => {
        setEmailForm((prev) => ({ ...prev, sending: true }));
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/send-verification-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: emailForm.email }),
            });

            const data = await res.text(); // hoặc json tùy backend
            if (!res.ok) throw new Error(data);
            toast.success("Đã gửi email xác minh");
            setEmailSent(true);
        } catch (err) {
            toast.error(err.message || "Không thể gửi email xác minh");
        } finally {
            setEmailForm((prev) => ({ ...prev, sending: false }));
        }
    };

    const handleVerifyCode = async () => {
        setVerifying(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: verifyCode }),
            });

            const data = await res.text();
            if (!res.ok) throw new Error(data);

            toast.success("Xác minh email thành công");
            setVerifyCode("");
            setEmailSent(false); // reset sau xác minh
        } catch (err) {
            toast.error(err.message || "Mã xác minh không hợp lệ");
        } finally {
            setVerifying(false);
        }
    };

    const fetchPrivacySettings = async () => {
        setLoading(true);
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        // if (!token) {
        //     toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        //     navigate("/login");
        //     return;
        // }

        try {
            const [generalRes, profileRes] = await Promise.all([
                fetch(`${process.env.REACT_APP_API_URL}/privacy`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch(`${process.env.REACT_APP_API_URL}/user/profile/${user.username}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            const generalData = await generalRes.json();
            const profileData = await profileRes.json();

            if (!generalRes.ok || !profileRes.ok) {
                throw new Error("Không thể lấy cài đặt quyền riêng tư.");
            }
            console.log("generalData", generalData);

            setSettings({
                postVisibility: generalData.data?.postVisibility ?? "public",
                commentPermission: generalData.data?.commentPermission ?? "public",
                profileViewer: profileData.data?.profilePrivacySetting ?? "public",
                customListId: profileData.data?.customListId ?? null,
            });
        } catch (error) {
            console.error("Lỗi khi lấy cài đặt:", error);
            toast.error(error.message || "Không thể tải cài đặt quyền riêng tư!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.username) {
            fetchPrivacySettings();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");

        try {
            // Gửi cập nhật bài đăng/bình luận
            const generalPrivacyRes = await fetch(`${process.env.REACT_APP_API_URL}/privacy`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postVisibility: settings.postVisibility,
                    commentPermission: settings.commentPermission,
                }),
            });

            const generalData = await generalPrivacyRes.json();
            if (!generalPrivacyRes.ok) {
                throw new Error(generalData.message || "Lỗi khi cập nhật quyền riêng tư bài đăng.");
            }

            // Gửi cập nhật hồ sơ cá nhân
            const profilePrivacyRes = await fetch(`${process.env.REACT_APP_API_URL}/user/profile/${user.username}/privacy`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    profilePrivacySetting: settings.profileViewer,
                }),
            });
            console.log("Sending profile privacy update:", {
                profilePrivacySetting: settings.profileViewer,
                customListId: settings.profileViewer === "custom" ? settings.customListId : null,
            });

            const profileData = await profilePrivacyRes.json();
            if (!profilePrivacyRes.ok) {
                throw new Error(profileData.message || "Lỗi khi cập nhật quyền riêng tư hồ sơ.");
            }

            toast.success("Cài đặt quyền riêng tư đã được lưu thành công!");
            await fetchPrivacySettings();
        } catch (error) {
            console.error("Lỗi khi lưu cài đặt quyền riêng tư:", error);
            toast.error(error.message || "Không thể lưu cài đặt!");
        } finally {
            setSaving(false);
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
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" role="status" />
            </div>
        );
    }

    return (
        <div className="sticky-top bg-[var(--background-color)] py-2 border-bottom dark:border-[var(--border-color)]" style={{ zIndex: 1020 }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={8}>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="mb-0 fw-bold text-[var(--text-color)]">Cài đặt Quyền riêng tư</h5>
                                <span className="text-[var(--text-color-muted)] small">Quản lý quyền truy cập nội dung</span>
                            </div>
                        </div>

                        {/* Privacy Settings */}
                        <div className="bg-[var(--comment-bg-color)] rounded-2xl shadow-sm border border-[var(--border-color)] p-4 mb-5">
                            <h4 className="text-[var(--text-color)] mb-4 flex items-center">
                                <FaLock className="me-2" />
                                Quyền riêng tư
                            </h4>

                            <Form.Group controlId="postVisibility" className="mb-3">
                                <Form.Label className="text-[var(--text-color)]">Ai có thể xem bài viết của bạn?</Form.Label>
                                <Form.Select
                                    name="postVisibility"
                                    value={settings.postVisibility}
                                    onChange={handleChange}
                                    className="bg-input"
                                >
                                    <option value="public">Mọi người</option>
                                    <option value="friends">Bạn bè</option>
                                    <option value="only_me">Chỉ mình tôi</option>
                                </Form.Select>
                            </Form.Group>

                            {/*<Form.Group controlId="commentPermission" className="mb-3">*/}
                            {/*    <Form.Label className="text-[var(--text-color)]">Ai có thể bình luận trên bài viết của bạn?</Form.Label>*/}
                            {/*    <Form.Select*/}
                            {/*        name="commentPermission"*/}
                            {/*        value={settings.commentPermission}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        className="bg-input"*/}
                            {/*    >*/}
                            {/*        <option value="public">Mọi người</option>*/}
                            {/*        <option value="friends">Bạn bè</option>*/}
                            {/*        <option value="onlyme">Chỉ mình tôi</option>*/}
                            {/*    </Form.Select>*/}
                            {/*</Form.Group>*/}

                            <Form.Group controlId="profileViewer" className="mb-3">
                                <Form.Label className="text-[var(--text-color)]">Ai có thể xem hồ sơ của bạn?</Form.Label>
                                <Form.Select
                                    name="profileViewer"
                                    value={settings.profileViewer}
                                    onChange={handleChange}
                                    className="bg-input"
                                >
                                    <option value="public">Mọi người</option>
                                    <option value="friends">Bạn bè</option>
                                    <option value="only_me">Chỉ mình tôi</option>
                                </Form.Select>
                            </Form.Group>



                            <div className="d-flex justify-content-end">
                                <button
                                    className="btn-primary"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>

                        {/* Password Change */}
                        <div className="bg-[var(--comment-bg-color)] rounded-2xl shadow-sm border border-[var(--border-color)] p-4">
                            <h4 className="text-[var(--text-color)] mb-4 flex items-center">
                                <FaKey className="me-2" />
                                Đổi mật khẩu
                            </h4>


                            <Form onSubmit={handlePasswordChange}>
                                <Form.Group controlId="currentPassword" className="mb-3">
                                    <Form.Label className="text-[var(--text-color)]">Mật khẩu hiện tại</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="bg-input"
                                    />
                                </Form.Group>

                                <Form.Group controlId="newPassword" className="mb-3">
                                    <Form.Label className="text-[var(--text-color)]">Mật khẩu mới</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="bg-input"
                                    />
                                </Form.Group>

                                <Form.Group controlId="confirmPassword" className="mb-4">
                                    <Form.Label className="text-[var(--text-color)]">Xác nhận mật khẩu mới</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="bg-input"
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-end">
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default SettingsPage;
