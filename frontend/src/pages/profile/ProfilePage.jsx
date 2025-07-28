import React, {useState, useEffect, useContext} from "react";
import {
    Image,
    Button,
    Nav,
    Spinner,
    ListGroup,
} from "react-bootstrap";
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaLink,
    FaEllipsisH,
    FaUserSlash,
    FaPhoneAlt,
} from "react-icons/fa";
import {Link, useParams, useNavigate} from "react-router-dom";
import TweetCard from "../../components/posts/TweetCard/TweetCard";
import EditProfileModal from "../../components/profile/EditProfileModal";
import SidebarRight from "../../components/layout/SidebarRight/SidebarRight";
import FriendshipButton from "../../components/friendship/FriendshipButton";
import FollowActionButton from "../../components/utils/FollowActionButton";
import {AuthContext} from "../../context/AuthContext";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMedia from "../../hooks/useMedia";

function ProfilePage() {
    const {user, setUser} = useContext(AuthContext);
    const {username} = useParams();
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPremiumAlert, setShowPremiumAlert] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isUserBlocked, setIsUserBlocked] = useState(false);
    const {mediaUrl, loading: mediaLoading} = useMedia(userProfile?.id);
    const [savedPosts, setSavedPosts] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false); // Thêm state cho modal báo cáo
    const [reportReasonId, setReportReasonId] = useState(""); // Thêm state cho lý do báo cáo
    const [reasons, setReasons] = useState([]); // Thêm state cho danh sách lý do
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const isOwnProfile = user?.username === username;
    const hasAccess = userProfile?.bio !== null || isOwnProfile;
    const defaultUserProfile = {
        id: null,
        username: "testuser",
        displayName: "Người dùng Test",
        bio: "Đây là một tài khoản ảo để kiểm tra giao diện người dùng. Rất vui được kết nối!",
        location: "Việt Nam",
        website: "https://example.com",
        dateOfBirth: "2000-01-01T00:00:00Z",
        followeeCount: 123,
        followerCount: 456,
        postCount: 789,
        isPremium: false,
        gender: 0,
        profileImageUrl: "https://via.placeholder.com/150?text=Avatar",
    };

    useEffect(() => {
        const fetchReportReasons = async () => {
            try {
                const token = sessionStorage.getItem("token") || localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_API_URL}/reports/report-reasons`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setReasons(Array.isArray(data) ? data : []);
                } else {
                    throw new Error(data.message || "Lỗi khi lấy danh sách lý do báo cáo");
                }
            } catch (error) {
                toast.error("Lỗi khi lấy danh sách lý do báo cáo: " + error.message);
            }
        };

        if (showReportModal) {
            fetchReportReasons();
        }
    }, [showReportModal]);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            if (!username || username === "undefined") {
                toast.error("Tên người dùng không hợp lệ.");
                setUserProfile(defaultUserProfile);
                setPosts([]);
                setLoading(false);
                if (user?.username) {
                    navigate(`/profile/${user.username}`);
                } else {
                    navigate("/");
                }
                return;
            }

            const token = sessionStorage.getItem("token") || localStorage.getItem("token");

            try {
                const profileResponse = await fetch(
                    `${process.env.REACT_APP_API_URL}/user/profile/${username}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const profileData = await profileResponse.json();
                if (!profileResponse.ok) {
                    throw new Error(profileData.message || "Lỗi khi lấy thông tin hồ sơ.");
                }

                if (user.username !== username) {
                    const blockResponse = await fetch(
                        `${process.env.REACT_APP_API_URL}/blocks/${profileData.id}/status`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const blockData = await blockResponse.json();
                    if (!blockResponse.ok) {
                        throw new Error(blockData.message || "Lỗi khi kiểm tra trạng thái chặn.");
                    }

                    if (blockData.isBlocked) {
                        setIsUserBlocked(true);
                        setLoading(false);
                        return;
                    }
                }

                setUserProfile({
                    ...profileData,
                    id: profileData.id,
                    postCount: profileData.postCount || 0,
                    website: profileData.website || "",
                    isPremium: profileData.isPremium || false,
                    profileImageUrl: profileData.profileImageUrl || "https://via.placeholder.com/150?text=Avatar",
                    location: profileData.locationName || "",
                });

                // Chỉ lấy bài đăng nếu có quyền truy cập (bio không null)
                if (profileData.bio !== null || user.username === username) {
                    const postsResponse = await fetch(
                        `${process.env.REACT_APP_API_URL}/posts/user/${username}`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const postsData = await postsResponse.json();
                    console.log("Posts API response:", postsData); // Debug
                    if (!postsResponse.ok) {
                        throw new Error(postsData.message || "Lỗi khi lấy bài đăng.");
                    }

                    setPosts(Array.isArray(postsData.data) ? postsData.data : []);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy hồ sơ:", error);
                toast.error(error.message || "Lỗi khi lấy hồ sơ.");
                setUserProfile(null);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, username, navigate]);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            if (!token || user?.username !== username) return;

            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/posts/saved-posts`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Lỗi khi lấy bài viết đã lưu.");
                }

                setSavedPosts(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Lỗi khi lấy bài viết đã lưu:", error);
                toast.error(error.message || "Không thể tải bài viết đã lưu!");
                setSavedPosts([]);
            }
        };

        if (activeTab === "savedArticles") {
            fetchSavedPosts();
        }
    }, [activeTab, user, username]);

    const handleBlockToggle = async () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/blocks/${userProfile.id}`,
                {
                    method: isBlocked ? "DELETE" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            if (response.ok) {
                setIsBlocked(!isBlocked);
                toast.success(isBlocked ? "Đã bỏ chặn người dùng!" : "Đã chặn người dùng!");
            } else {
                throw new Error(data.message || (isBlocked ? "Lỗi khi bỏ chặn." : "Lỗi khi chặn người dùng."));
            }
        } catch (error) {
            console.error("Lỗi khi xử lý chặn:", error);
            toast.error(error.message || "Lỗi khi xử lý chặn.");
        }
    };

    const handleReportSubmit = async () => {
        if (!reportReasonId) {
            toast.error("Vui lòng chọn lý do báo cáo!");
            return;
        }

        try {
            setIsSubmittingReport(true);
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reports/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reporterId: user.id,
                    targetId: userProfile.id,
                    targetTypeId: 4, 
                    reasonId: parseInt(reportReasonId),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Không thể gửi báo cáo!");

            toast.success("Đã gửi báo cáo thành công!");
            setShowReportModal(false);
            setReportReasonId("");
        } catch (err) {
            toast.error("Lỗi khi gửi báo cáo: " + err.message);
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleEditProfile = (updatedProfile) => {
        if (!updatedProfile) {
            toast.error("Không thể cập nhật hồ sơ.");
            return;
        }

        const updatedProfileWithLocation = {
            ...updatedProfile,
            location: updatedProfile.locationName || "", // Ánh xạ locationName thành location
        };

        setUserProfile(updatedProfileWithLocation);
        setUser(updatedProfileWithLocation);
        localStorage.setItem("user", JSON.stringify(updatedProfileWithLocation));
        toast.success("Cập nhật hồ sơ thành công!");
    };

    const fetchProfileAndPosts = async () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            toast.error("Không tìm thấy token. Vui lòng đăng nhập lại!");
            navigate("/");
            return;
        }

        try {
            const profileResponse = await fetch(
                `${process.env.REACT_APP_API_URL}/user/profile/${username}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const profileData = await profileResponse.json();
            if (!profileResponse.ok) {
                throw new Error(profileData.message || "Không thể lấy thông tin hồ sơ!");
            }

            setUserProfile({
                ...profileData,
                id: profileData.id,
                postCount: profileData.postCount || 0,
                website: profileData.website || "",
                isPremium: profileData.isPremium || false,
                profileImageUrl: profileData.profileImageUrl || "https://via.placeholder.com/150?text=Avatar",
            });

            const postsResponse = await fetch(
                `${process.env.REACT_APP_API_URL}/posts/user/${username}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const postsData = await postsResponse.json();
            console.log("Posts refresh API response:", postsData); // Debug
            if (!postsResponse.ok) {
                throw new Error(postsData.message || "Không thể lấy bài đăng!");
            }

            setPosts(Array.isArray(postsData.data) ? postsData.data : []);

        } catch (error) {
            console.error("Lỗi khi làm mới dữ liệu:", error);
            toast.error(error.message || "Lỗi khi làm mới dữ liệu!");
        }
    };

    const renderTabContent = () => {
        if (!hasAccess) {
            return (
                <p className="text-dark text-center p-4">
                    Bạn không có quyền xem nội dung này.
                </p>
            );
        }

        const renderPostsList = (list) =>
            list.length > 0 ? (
                list.map((item) => (
                    <TweetCard
                        key={item.id}
                        tweet={item}
                        onPostUpdate={fetchProfileAndPosts}
                    />
                ))
            ) : (
                <p className="text-dark text-center p-4">Không có bài đăng nào.</p>
            );

        switch (activeTab) {
            case "posts":
                return renderPostsList(posts);

            case "shares":
                return (
                    <p className="text-dark text-center p-4">
                        Không có bài chia sẻ nào.
                    </p>
                );

            case "savedArticles":
                return savedPosts.length > 0 ? (
                    savedPosts.map((item) => (
                        <TweetCard
                            key={item.id}
                            tweet={item}
                            onPostUpdate={fetchProfileAndPosts}
                        />
                    ))
                ) : (
                    <p className="text-dark text-center p-4">
                        Không có bài viết đã lưu nào.
                    </p>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" role="status"/>
            </div>
        );
    }

    if (isUserBlocked) {
        return (
            <div className="text-center p-4">
                <p className="text-dark">Xin lỗi, hiện tại không thể tìm thấy người dùng.</p>
                <Button variant="primary" onClick={() => navigate("/home")}>
                    Quay lại trang chủ
                </Button>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="text-center p-4">
                <p className="text-dark">
                    Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.
                </p>
                <Button variant="primary" onClick={() => navigate("/home")}>
                    Quay lại trang chủ
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Top Navigation */}
            <header className="sticky top-0 bg-[var(--background-color)] border-b border-gray-200 dark:border-gray-700 py-3 z-50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/home" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <FaArrowLeft className="text-lg" />
                        </Link>
                        <div>
                            <h5 className="font-semibold text-lg">{userProfile.displayName}</h5>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                            {hasAccess ? `${userProfile.postCount || 0} bài đăng` : "Hồ sơ bị hạn chế"}
                        </span>
                        </div>
                    </div>
                </div>
                header>

                {/* Main Content */}
                <main className="flex flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Left Content */}
                    <div className="w-full lg:w-2/3 lg:pr-8">
                        {/* Profile Header */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={userProfile.profileImageUrl || "https://via.placeholder.com/150?text=Avatar"}
                                        roundedCircle
                                        className="border-4 border-white dark:border-gray-700"
                                        style={{ width: 120, height: 120, objectFit: "cover" }}
                                    />
                                    <div>
                                        <h4 className="font-bold text-xl">{userProfile.displayName}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{userProfile.username}</p>
                                    </div>
                                </div>
                                {isOwnProfile ? (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowEditModal(true)}
                                        className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <div className="flex gap-2 flex-wrap">
                                        <FollowActionButton
                                            targetId={userProfile.id}
                                            disabled={isBlocked}
                                            onFollowChange={(isFollowing) =>
                                                setUserProfile((prev) => ({
                                                    ...prev,
                                                    followerCount: prev.followerCount + (isFollowing ? 1 : -1),
                                                }))
                                            }
                                            className="px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                                        />
                                        {!isBlocked && <FriendshipButton targetId={userProfile.id} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" />}
                                        <Button
                                            variant={isBlocked ? "outline-secondary" : "outline-danger"}
                                            onClick={handleBlockToggle}
                                            className={`px-4 py-2 rounded-lg border ${isBlocked ? 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700' : 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900'} transition-colors`}
                                        >
                                            <FaUserSlash className="inline mr-1" /> {isBlocked ? "Bỏ chặn" : "Chặn"}
                                        </Button>
                                        <Button
                                            variant="outline-warning"
                                            onClick={() => setShowReportModal(true)}
                                            disabled={isBlocked}
                                            className="px-4 py-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900 transition-colors"
                                        >
                                            Báo cáo
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            {hasAccess && (
                                <div className="grid gap-2 text-sm">
                                    {userProfile.bio && <p className="text-gray-700 dark:text-gray-300">{userProfile.bio}</p>}
                                    {userProfile.locationName && (
                                        <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <FaMapMarkerAlt /> {userProfile.locationName}
                                        </p>
                                    )}
                                    <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <FaCalendarAlt /> Ngày sinh: {new Date(userProfile.dateOfBirth).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <FaEllipsisH /> Giới tính: {userProfile.gender === 0 ? "Nam" : userProfile.gender === 1 ? "Nữ" : "Khác"}
                                    </p>
                                    {userProfile.phoneNumber && (
                                        <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <FaPhoneAlt /> Liên hệ: {userProfile.phoneNumber}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tab Navigation */}
                        {hasAccess && (
                            <Nav variant="tabs" className="mb-6 border-b border-gray-200 dark:border-gray-700">
                                {["posts", "shares", ...(isOwnProfile ? ["savedArticles"] : [])].map((tab) => (
                                    <Nav.Item key={tab} className="flex-1">
                                        <Nav.Link
                                            active={activeTab === tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`relative py-3 text-center font-medium transition-colors duration-200 ${
                                                activeTab === tab
                                                    ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
                                                    : "text-gray-500 hover:text-[var(--primary-color)]"
                                            }`}
                                        >
                                            {tab === "posts" && "Bài đăng"}
                                            {tab === "shares" && "Chia sẻ"}
                                            {tab === "savedArticles" && "Đã lưu"}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        )}

                        {/* Tab Content */}
                        <div className="transition-opacity duration-300">{renderTabContent()}</div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="hidden lg:block lg:w-1/3">
                        <SidebarRight />
                    </aside>
                </main>

                {/* Edit Modal */}
                {isOwnProfile && (
                    <EditProfileModal
                        show={showEditModal}
                        handleClose={() => setShowEditModal(false)}
                        userProfile={userProfile}
                        onSave={handleEditProfile}
                        username={username}
                    />
                )}

                {/* Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
                        <div className="bg-[var(--background-color)] rounded-xl shadow-xl w-full max-w-md p-6 text-[var(--text-color)] transform transition-transform duration-300 scale-100">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Báo cáo người dùng</h3>
                                <button
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setShowReportModal(false)}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="mb-4">
                                <label htmlFor="reportReason" className="block text-sm font-medium mb-2">
                                    Lý do báo cáo
                                </label>
                                <select
                                    id="reportReason"
                                    value={reportReasonId}
                                    onChange={(e) => setReportReasonId(e.target.value)}
                                    className="w-full p-2.5 rounded-md bg-[var(--background-color)] border border-gray-300 dark:border-gray-600 text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none transition-colors"
                                >
                                    <option value="">Chọn lý do</option>
                                    {reasons.map((reason) => (
                                        <option key={reason.id} value={reason.id}>
                                            {reason.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-[var(--text-color)] rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    onClick={() => setShowReportModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center transition-colors"
                                    onClick={handleReportSubmit}
                                    disabled={isSubmittingReport}
                                >
                                    {isSubmittingReport ? (
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    ) : (
                                        "Gửi báo cáo"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default ProfilePage;
