import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Image as BootstrapImage, Modal, Button } from "react-bootstrap";

// ===== Mock data (replace src with your local files in /public/reels/*) =====
const MOCK_REELS = [
    {
        id: "r1",
        src: "https://storage.googleapis.com/social-media-uploads/258be77f-a6e9-4156-8d5d-72983f0c143f_480705509_9193275347425484_3121235449629224349_n (1).mp4",
        poster: "/reels/poster1.jpg",
        user: { name: "Lana", avatar: "https://i.pravatar.cc/100?img=15" },
        caption: "Sunset skating vibes ✨",
        hashtags: ["#reels", "#sunset", "#skate"],
        music: "Feel Good - Syn Cole",
        liked: false,
        likes: 1203,
        comments: 87,
    },
    {
        id: "r2",
        src: "https://storage.googleapis.com/social-media-uploads/258be77f-a6e9-4156-8d5d-72983f0c143f_480705509_9193275347425484_3121235449629224349_n (1).mp4",
        poster: "/reels/poster2.jpg",
        user: { name: "Kenji", avatar: "https://i.pravatar.cc/100?img=11" },
        caption: "Quick ramen hack you need to try 🍜",
        hashtags: ["#food", "#ramen", "#hack"],
        music: "Lo-fi Beat - FASSounds",
        liked: true,
        likes: 5342,
        comments: 241,
    },
    {
        id: "r3",
        src: "https://storage.googleapis.com/social-media-uploads/258be77f-a6e9-4156-8d5d-72983f0c143f_480705509_9193275347425484_3121235449629224349_n (1).mp4",
        poster: "/reels/poster3.jpg",
        user: { name: "Maya", avatar: "https://i.pravatar.cc/100?img=5" },
        caption: "3 tips to boost your CSS game 💡",
        hashtags: ["#css", "#frontend", "#devtips"],
        music: "Future Bass - Ookean",
        liked: false,
        likes: 987,
        comments: 66,
    },
];

// A single Reel item
function Reel({ data, isActive, onRequestPrev, onRequestNext }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isLiked, setIsLiked] = useState(!!data.liked);
    const [likeCount, setLikeCount] = useState(data.likes || 0);
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
    }, [isActive]);

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
        // TODO: call API here
    };

    const onVideoEnded = () => {
        // auto advance to next reel when finished
        onRequestNext?.();
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            <div
                className="shadow-xl"
                style={{scrollSnapAlign: "start", width: "min(480px, 92vw)", aspectRatio: "6 / 19" }}
            >
                <video
                    ref={videoRef}
                    src={data.src}
                    poster={data.poster}
                    className="absolute inset-0 w-full h-full object-cover z-0"
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
                    >
                        <FaChevronLeft />
                    </button>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full text-sm">
                        <span>Reels</span>
                    </div>
                    <button className="pointer-events-auto bg-black/40 rounded-full p-2">
                        <FaEllipsisH />
                    </button>
                </div>

                {/* Right action rail */}
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white">
                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={handleLike}
                    >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <div className="text-xs opacity-90">{likeCount.toLocaleString()}</div>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={() => setShowComments(true)}
                    >
                        <FaCommentDots />
                    </button>
                    <div className="text-xs opacity-90">{data.comments}</div>

                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3">
                        <FaShare />
                    </button>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={() => setIsSaved((s) => !s)}
                    >
                        {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={toggleMute}
                    >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>

                    <button
                        className="bg-black/40 hover:bg-black/60 rounded-full p-3"
                        onClick={togglePlay}
                    >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                </div>

                {/* Bottom meta */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <BootstrapImage
                            src={data.user.avatar}
                            roundedCircle
                            width={40}
                            height={40}
                            alt={data.user.name}
                        />
                        <div className="font-semibold">{data.user.name}</div>
                        <button className="ml-2 text-sm bg-white text-black rounded-full px-3 py-1">
                            Follow
                        </button>
                    </div>
                    <div className="text-sm leading-snug whitespace-pre-wrap">
                        {data.caption} {" "}
                        {data.hashtags?.map((h) => (
                            <span key={h} className="opacity-80 mr-1">
                  {h}
                </span>
                        ))}
                    </div>
                    {data.music && (
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

export default function ReelsPage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    const onScroll = (e) => {
        const el = e.currentTarget;
        const idx = Math.round(el.scrollTop / window.innerHeight);
        if (idx !== activeIndex) setActiveIndex(idx);
    };

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowDown") {
                setActiveIndex((i) => Math.min(MOCK_REELS.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
                setActiveIndex((i) => Math.max(0, i - 1));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Snap to active on index change
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTo({ top: activeIndex * window.innerHeight, behavior: "smooth" });
    }, [activeIndex]);

    return (
        <div className="relative h-screen w-full bg-black text-white">
            {/* Header (optional). Hide if you embed in your own layout) */}
            {/* <div className="absolute z-10 top-0 left-0 right-0 p-3 text-center text-sm opacity-80">Reels</div> */}

            <div
                ref={containerRef}
                onScroll={onScroll}
                className="h-full w-full overflow-y-scroll"
                style={{ scrollSnapType: "y mandatory" }}
            >
                {MOCK_REELS.map((reel, idx) => (
                    <Reel
                        key={reel.id}
                        data={reel}
                        isActive={idx === activeIndex}
                        onRequestPrev={() => setActiveIndex((i) => Math.max(0, i - 1))}
                        onRequestNext={() =>
                            setActiveIndex((i) => Math.min(MOCK_REELS.length - 1, i + 1))
                        }
                    />)
                )}
            </div>

            {/* Tiny helper to show current index for debugging */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs opacity-70">
                {activeIndex + 1}/{MOCK_REELS.length}
            </div>
        </div>
    );
}
