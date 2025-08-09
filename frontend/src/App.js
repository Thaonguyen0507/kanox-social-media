import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Modal,
  Button,
  Image,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import moment from "moment";
import PrivateRoute from "./components/common/PrivateRoute/PrivateRoute";
import { EmojiProvider } from "./context/EmojiContext";

import SidebarLeft from "./components/layout/SidebarLeft/SidebarLeft";
import { ThemeContext, ThemeProvider } from "./context/ThemeContext";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import {
  WebSocketContext,
  WebSocketProvider,
} from "./context/WebSocketContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import CommunityLayout from "./components/layout/Layout/CommunityLayout";
import MainLayout from "./components/layout/Layout/MainLayout";
import CommunityWrapper from "./pages/community/CommunityWrapper";
import GroupCommunityWrapper from "./pages/community/GroupCommunityWrapper";
import GroupMembersWrapper from "./pages/community/GroupMembersWrapper";
import GroupReportsWrapper from "./pages/community/GroupReportsWrapper"
import useSingleMedia from "./hooks/useSingleMedia";
// Import các page
import SignupPage from "./pages/auth/signup/signupPage";
import HomePage from "./pages/home/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ResetPasswordPage from "./pages/auth/login/ResetPasswordPage";
import ExplorePage from "./pages/search/ExplorePage";
import NotificationPage from "./pages/Notifications/NotificationPage";
import MessengerPage from "./pages/Messenger/MessengerPage";
import LoadingPage from "./components/common/Loading/LoadingPage";
import VerifyEmailPage from "./pages/auth/login/VerifyEmailPage";
import CustomPrivacyListPage from "./pages/privacy/CustomPrivacyListPage";
import BlockedUsersPage from "./pages/block/BlockedUsersPage";
import SettingsPage from "./pages/settings/SettingsPage";
import FriendsPage from "./pages/friends/FriendsPage";
import AdminPage from "./pages/admin/adminpage";
import Call from "./components/messages/Call";
import GroupCommunityPage from "./pages/community/GroupCommunityPage";
import GroupMembersPage from "./pages/community/GroupMembersPage";
import GroupMembersManagementPage from "./pages/admin/GroupMembersManagementPage";
import GroupAdminPage from "./pages/admin/GroupAdminPage";
import PostDetail from "./pages/admin/PostDetail";
import PostsManagement from "./components/admin/PostsManagement";

import PremiumPage from "./pages/premium/premiumPage";
import CreateStoryPage from "./pages/story/CreateStoryPage";
import GroupReportsPage from "./pages/community/GroupReportsPage";
import ReelsPage from "./pages/reels/reelsPage";

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [chatIds, setChatIds] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [isInCall, setIsInCall] = useState(false);
  const { user, token } = useContext(AuthContext);
  const { subscribe, unsubscribe, publish } =
    useContext(WebSocketContext) || {};
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/assets/sound/ringtone.mp3");
      ringtoneRef.current.loop = true;
    }

    if (showCallModal) {
      ringtoneRef.current.play().catch(err => {
        console.warn("Không thể phát chuông:", err);
      });
    } else {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    };
  }, [showCallModal]);

  const { mediaUrl, loading: mediaLoading, error: mediaError } = useSingleMedia(
      incomingCall?.fromId,
      "PROFILE",
      "image"
  );

  const handleCallStatus = (status) => {
    setIsInCall(status);
  };

  useEffect(() => {
    if (!user || !token) {
      setIsLoading(false);
      return;
    }

    const fetchChatIdsAndMembers = async () => {
      try {
        const chatResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/chat/user/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!chatResponse.ok) {
          console.error("Error fetching chat IDs");
          return;
        }
        const chats = await chatResponse.json();
        setChatIds(chats.map((chat) => chat.id));

        const userMapTemp = {};
        for (const chat of chats) {
          const membersResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/chat/${chat.id}/members`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (membersResponse.ok) {
            const members = await membersResponse.json();
            members.forEach((member) => {
              userMapTemp[member.userId] = member.displayName;
            });
          }
        }
        setUserMap(userMapTemp);
        console.log("📄 User map:", userMapTemp);
      } catch (error) {
        console.error("Error fetching chat IDs or members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatIdsAndMembers();
  }, [user, token]);

  useEffect(() => {
    if (!subscribe || !unsubscribe || !publish || !user || !token) {
      console.log(
        "Skipping subscriptions: Missing WebSocket context or user data"
      );
      return;
    }

    const subscriptions = [];
    //topic for user notification
    subscriptions.push(
        subscribe(
            `/topic/notifications/${user.id}`,
            (message) => {
              console.log("Received notification:", message);
              if (message.type === "bulk-read") {
                // Xử lý thông báo đánh dấu tất cả là đã đọc
                setNotifications([]);
                toast.info(message.message, {
                  position: "top-right",
                  autoClose: 3000,
                });
              } else {
                // Xử lý thông báo cá nhân
                setNotifications((prev) => [...prev, message]);
                toast.info(`${message.displayName}: ${message.message}`, {
                  position: "top-right",
                  autoClose: 3000,
                  onClick: () => {
                    if (message.targetType === "GROUP") {
                      navigate(`/community/${message.targetId}`);
                    } else if (message.targetType === "POST") {
                      navigate(`/post/${message.targetId}`);
                    } else {
                      navigate(`/profile/${message.username}`);
                    }
                  },
                });
              }
            },
            `notifications-${user.id}`
        )
    );

    // topic for call
    chatIds.forEach((chatId) => {
      subscriptions.push(
        subscribe(
          `/topic/call/${chatId}`,
          (message) => {
            console.log("Received call signal:", message);
            if (message.type === "start" && message.userId !== user.id) {
              const isBusy =
                  isInCall ||
                  window.location.pathname.startsWith("/call");

              if (isBusy) {
                console.log("🚫 Bận hoặc đã ở trong trang call, từ chối cuộc gọi");
                publish("/app/sendMessage", {
                  chatId: message.chatId,
                  senderId: user.id,
                  content: "⚠️ Máy bận",
                  typeId: 4,
                });
                publish("/app/call/end", {
                  chatId: message.chatId,
                  callSessionId: message.sessionId,
                  userId: user.id,
                });
                return;
              }

              // ✅ OK → hiển thị modal nhận cuộc gọi
              setIncomingCall({
                chatId: message.chatId,
                sessionId: message.sessionId,
                from: userMap[message.userId] || "Người gọi không xác định",
                fromId: message.userId,
              });
              setShowCallModal(true);
            }

          },
          `call-${chatId}`
        )
      );
    });

    if (user.isAdmin) {
      subscriptions.push(
        subscribe(
          "/topic/admin/reports",
          (message) => {
            console.log("Received new report notification:", message);
            toast.info(
              `Báo cáo mới từ ${message.reporterUsername}: ${message.reason}`,
              {
                onClick: () => {
                  navigate("/admin", { state: { newReport: message } });
                },
              }
            );
          },
          "admin-reports"
        )
      );
    }

    const handleIncomingCall = (event) => {
      const { chatId, sessionId, from, to } = event.detail;
      if (to !== user.username) {
        console.log("⛔ Mình là người gọi, không hiển thị modal.");
        return;
      }
      if (isInCall) {
        console.log("🚫 Đang trong cuộc gọi, gửi tín hiệu máy bận");
        publish("/app/sendMessage", {
          chatId: chatId,
          senderId: user.id,
          content: "⚠️ Máy bận",
          typeId: 4,
        });
        // Gửi tín hiệu từ chối cuộc gọi
        publish("/app/call/end", {
          chatId,
          callSessionId: sessionId,
          userId: user.id,
        });
        return;
      }
      if (window.location.pathname.startsWith("/call")) {
        console.log("📞 Đã ở trong trang call, từ chối cuộc gọi mới");
        return;
      }
      setIncomingCall({
        chatId,
        sessionId,
        from: userMap[from] || "Người gọi không xác định",
        fromId: from,
      });
      setShowCallModal(true);
    };
    window.addEventListener("incomingCall", handleIncomingCall);

    return () => {
      subscriptions.forEach((_, index) =>
        unsubscribe(`call-${chatIds[index]}`)
      );
      window.removeEventListener("incomingCall", handleIncomingCall);
    };
  }, [
    chatIds,
    subscribe,
    unsubscribe,
    user,
    navigate,
    token,
    userMap,
    isInCall,
    publish,
  ]);

  const acceptCall = () => {
    setShowCallModal(false);
    setIsInCall(true); // Cập nhật trạng thái khi chấp nhận cuộc gọi
    navigate(`/call/${incomingCall.chatId}`);
  };

  const rejectCall = () => {
    setShowCallModal(false);
    if (publish && incomingCall) {
      publish("/app/call/end", {
        chatId: incomingCall.chatId,
        callSessionId: incomingCall.sessionId,
        userId: user?.id,
      });
    }
    setIncomingCall(null);
  };

  return (
    <>
      {isLoading ? (
        <LoadingPage />
      ) : (
        <>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Private Routes */}
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <HomePage
                      onShowCreatePost={() => setShowCreatePost(true)}
                      onToggleDarkMode={toggleDarkMode}
                      isDarkMode={isDarkMode}
                    />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/premium"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <PremiumPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
                path="/reels"
                element={
                  <PrivateRoute>
                    <MainLayout
                        onShowCreatePost={() => setShowCreatePost(true)}
                        onToggleDarkMode={toggleDarkMode}
                        isDarkMode={isDarkMode}
                    >
                      <ReelsPage />
                    </MainLayout>
                  </PrivateRoute>
                }
            />
            <Route
              path="/profile/:username"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <ProfilePage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/me"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <ProfilePage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/explore"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <ExplorePage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <NotificationPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <MessengerPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/communities"
              element={
                <PrivateRoute>
                  <CommunityWrapper />
                </PrivateRoute>
              }
            />
            <Route
              path="/privacy/lists"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <CustomPrivacyListPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/blocks"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <BlockedUsersPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route path="/posts" element={<PostsManagement />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <SettingsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <FriendsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups/:groupId/members"
              element={
                <PrivateRoute>
                  <GroupMembersWrapper>
                    <GroupMembersPage />
                  </GroupMembersWrapper>
                </PrivateRoute>
              }
            />

            <Route
                path="/groups/:groupId/reports"
                element={
                  <PrivateRoute>
                    <GroupReportsWrapper>
                      <GroupReportsPage />
                    </GroupReportsWrapper>
                  </PrivateRoute>
                }
            />
            <Route
              path="/call/:chatId"
              element={
                <PrivateRoute>
                  <Call onEndCall={() => setIsInCall(false)} />{" "}
                  {/* Cập nhật trạng thái khi kết thúc cuộc gọi */}
                </PrivateRoute>
              }
            />
            <Route
              path="/community/:groupId"
              element={
                <PrivateRoute>
                  <GroupCommunityWrapper />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/groups/:groupId/members"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <GroupMembersManagementPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/create-story"
              element={
                <PrivateRoute>
                  <MainLayout
                    onShowCreatePost={() => setShowCreatePost(true)}
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  >
                    <CreateStoryPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/groups/:groupId/view"
              element={<GroupAdminPage />}
            />
          </Routes>

          <Modal
              show={showCallModal}
              centered
              onHide={rejectCall}
              className="modal-shake modal-fade-slide"
              animation={true}
          >
            <Modal.Body className="bg-[var(--background-color)] text-[var(--text-color)] text-center py-5">
              <h4 className="mb-4 font-semibold">📞 Cuộc gọi đến</h4>

              {mediaLoading ? (
                  <div className="d-flex justify-content-center mb-4">
                    <Spinner animation="border" size="lg" />
                  </div>
              ) : (
                  <div className="ringing-avatar d-inline-block mb-4">
                    <Image
                        src={mediaError ? "https://via.placeholder.com/100" : mediaUrl || "https://via.placeholder.com/100"}
                        roundedCircle
                        width={100}
                        height={100}
                        className="shadow-lg"
                    />
                  </div>
              )}

              <h5 className="mb-5">{incomingCall?.from || "Người gọi không xác định"}</h5>

              <div className="d-flex justify-content-center gap-3">
                <Button variant="outline-danger" size="lg" onClick={rejectCall}>
                  ❌ Từ chối
                </Button>
                <Button variant="success" size="lg" onClick={acceptCall}>
                  ✅ Chấp nhận
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <EmojiProvider>
            <ThemeProvider>
              <AppContent />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </ThemeProvider>
          </EmojiProvider>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
