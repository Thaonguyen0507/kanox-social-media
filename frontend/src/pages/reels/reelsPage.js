import React, { useEffect, useRef, useState, useContext } from "react";
import {
    FaPlay,
    FaPause,
    FaVolumeMute,
    FaVolumeUp,
    FaHeart,
    FaRegHeart,
    FaCommentDots,
    FaShare,
    FaBookmark,
    FaRegBookmark,
    FaMusic,
    FaEllipsisH,
    FaChevronLeft,
} from "react-icons/fa";
import { Image as BootstrapImage, Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContext";

/**
 * Helper: từ API posts => mảng reels
 * - Mỗi media có url .mp4 trong 1 post => 1 reel
 * - poster: lấy ảnh đầu tiên (media.type === "image") nếu có
 */
function normalizeReels(apiData = []) {
    const reels = [];

    for (const post of apiData) {
        const medias = Array.isArray(post.media) ? post.media : [];
        const firstImage =
            medias.find((m) => (m?.type || "").toLowerCase() === "image" && typeof m?.url === "string")?.url || null;

        const videos = medias.filter((m) => {
            if (!m || typeof m.url !== "string") return false;
            const url = m.url.trim().toLowerCase();
            // Ưu tiên type === "video", đồng thời đảm bảo đuôi .mp4 như yêu cầu
            return (m.type || "").toLowerCase() === "video" && url.endsWith(".mp4");
        });

        for (const v of videos) {
            reels.push({
                // id duy nhất cho reel này
                id: `${post.id}_${v.id}`,
                src: v.url,                // video .mp4
                poster: firstImage,        // ảnh đại diện (nếu có)
                user: {
                    name: post?.owner?.displayName || post?.owner?.username || "Unknown",
                    avatar: post?.groupAvatarUrl || null, // nếu không có, component sẽ tự fallback
                },
                caption: post?.content || "",
                hashtags: undefined,       // không có trong response => để trống
                music: undefined,          // không có trong response => để trống
                liked: false,              // chưa có field => để mặc định
                likes: Number(post?.likeCount) || 0,
                comments: Number(post?.commentCount) || 0,
                // lưu thêm vài info nếu bạn cần dùng sau
                _rawPostId: post?.id,
                _rawMediaId: v?.id,
                _createdAt: post?.createdAt,
            });
        }
    }

    return reels;
}

// ===================== A single Reel item =====================
function Reel({ data, isActive, onRequestPrev, onRequestNext }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isLiked, setIsLiked] = useState(!!data?.liked);
    const [likeCount, setLikeCount] = useState(Number(data?.likes) || 0);
    const [isSaved, setIsSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Auto play/pause when active
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = isMuted;
        if (isActive) {
            v.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            v.pause();
            setIsPlaying(false);
        }
    }, [isActive, isMuted]);

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            v.play();
            setIsPlaying(true);
        } else {
            v.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleLike = () => {
        setIsLiked((prev) => !prev);
        setLikeCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1));
        // TODO: call like API here nếu cần
    };

    const onVideoEnded = () => {
        onRequestNext?.();
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            <div
                className="shadow-xl"
                style={{ scrollSnapAlign: "start", width: "min(480px, 92vw)", aspectRatio: "6 / 19" }}
            >
                <video
                    ref={videoRef}
                    src={data?.src}
                    poster={data?.poster || undefined}
                    className="absolute inset-0 w-w-80 m-auto h-full object-cover z-0"
                    loop={false}
                    playsInline
                    muted={isMuted}
                    onEnded={onVideoEnded}
                    onClick={togglePlay}
                />

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between text-white pointer-events-none z-10">
                    <button
                        className="pointer-events-auto bg-black/40 hover:bg-black/60 rounded-full px-3 py-2"
                        onClick={onRequestPrev}
                        aria-label="Previous reel"
                    >
                        <FaChevronLeft />
                    </button>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full text-sm">
                        <span>Reels</span>
                    </div>
                    <button className="pointer-events-auto bg-black/40 rounded-full p-2" aria-label="More">
                        <FaEllipsisH />
                    </button>
                </div>

                {/* Right action rail */}
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white">
                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={handleLike}
                        aria-label={isLiked ? "Unlike" : "Like"}
                    >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <div className="text-xs opacity-90">{likeCount.toLocaleString()}</div>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={() => setShowComments(true)}
                        aria-label="Comments"
                    >
                        <FaCommentDots />
                    </button>
                    <div className="text-xs opacity-90">{data?.comments ?? 0}</div>

                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3" aria-label="Share">
                        <FaShare />
                    </button>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={() => setIsSaved((s) => !s)}
                        aria-label={isSaved ? "Unsave" : "Save"}
                    >
                        {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={togglePlay}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                </div>

                {/* Bottom meta */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <BootstrapImage
                            src={data?.user?.avatar || "https://i.pravatar.cc/100"}
                            roundedCircle
                            width={40}
                            height={40}
                            alt={data?.user?.name || "user"}
                        />
                        <div className="font-semibold">{data?.user?.name || "Unknown"}</div>
                        <button className="ml-2 text-sm bg-white text-black rounded-full px-3 py-1">
                            Follow
                        </button>
                    </div>
                    <div className="text-sm leading-snug whitespace-pre-wrap">
                        {data?.caption || ""}
                        {" "}
                        {Array.isArray(data?.hashtags) &&
                            data.hashtags.map((h) => (
                                <span key={h} className="opacity-80 mr-1">
                  {h}
                </span>
                            ))}
                    </div>
                    {data?.music && (
                        <div className="mt-1 flex items-center gap-2 text-sm opacity-90">
                            <FaMusic /> <span>{data.music}</span>
                        </div>
                    )}
                </div>

                {/* Comments modal (mock) */}
                <Modal show={showComments} onHide={() => setShowComments(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Bình luận</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-sm text-muted">
                            (Giả lập) Chỗ này hiển thị danh sách bình luận và ô nhập bình luận.
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowComments(false)}>
                            Đóng
                        </Button>
                        <Button variant="primary">Gửi</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

// ===================== Reels Page =====================
export default function ReelsPage() {
    const { user } = useContext(AuthContext);
    const [reels, setReels] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    // Đổi endpoint nếu backend của bạn khác:
    const ENDPOINT = `${process.env.REACT_APP_API_URL}/posts/newsfeed`;
    // ví dụ nếu có /reels feed riêng: `${process.env.REACT_APP_API_URL}/reels`

    const fetchReels = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(ENDPOINT, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to fetch reels!");
            }

            const { message, data } = await res.json();

            if (Array.isArray(data)) {
                const normalized = normalizeReels(data);
                console.log(normalized);
                setReels(normalized);
                toast.success(message || "Lấy reels thành công");
            } else {
                setReels([]);
                setError("Invalid data format from API");
                toast.error("Dữ liệu không đúng định dạng");
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
            setReels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const onScroll = (e) => {
        const el = e.currentTarget;
        const idx = Math.round(el.scrollTop / window.innerHeight);
        if (idx !== activeIndex) setActiveIndex(idx);
    };

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowDown") {
                setActiveIndex((i) => Math.min(reels.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
                setActiveIndex((i) => Math.max(0, i - 1));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [reels.length]);

    // Snap to active on index change
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTo({ top: activeIndex * window.innerHeight, behavior: "smooth" });
    }, [activeIndex]);

    return (
        <div className="relative h-screen w-full bg-black text-white">
            <div
                ref={containerRef}
                onScroll={onScroll}
                className="h-full w-full overflow-y-scroll"
                style={{ scrollSnapType: "y mandatory" }}
            >
                {loading && (
                    <div className="h-screen w-full flex items-center justify-center">
                        <Spinner animation="border" role="status" />
                        <span className="ml-2">Đang tải...</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="h-screen w-full flex items-center justify-center text-red-500">
                        {error}
                    </div>
                )}

                {!loading && !error && reels.length === 0 && (
                    <div className="h-screen w-full flex items-center justify-center opacity-80">
                        Không có reels nào.
                    </div>
                )}

                {!loading &&
                    !error &&
                    reels.length > 0 &&
                    reels.map((reel, idx) => (
                        <Reel
                            key={reel.id || idx}
                            data={reel}
                            isActive={idx === activeIndex}
                            onRequestPrev={() => setActiveIndex((i) => Math.max(0, i - 1))}
                            onRequestNext={() =>
                                setActiveIndex((i) => Math.min(reels.length - 1, i + 1))
                            }
                        />
                    ))}
            </div>

            {/* Tiny helper to show current index for debugging */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs opacity-70">
                {reels.length > 0 ? `${activeIndex + 1}/${reels.length}` : "0/0"}
            </div>
        </div>
    );
}
