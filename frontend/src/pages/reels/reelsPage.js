import React, { useEffect, useRef, useState } from "react";
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
    FaChevronUp,
    FaChevronDown,
    FaPlus,
} from "react-icons/fa";
import { Image as BootstrapImage, Modal, Button, Form } from "react-bootstrap";

const MOCK_REELS = [
    {
        id: "r1",
        src: "\"https://storage.googleapis.com/social-media-uploads/258be77f-a6e9-4156-8d5d-72983f0c143f_480705509_9193275347425484_3121235449629224349_n (1).mp4",
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
        src: "\"https://storage.googleapis.com/social-media-uploads/258be77f-a6e9-4156-8d5d-72983f0c143f_480705509_9193275347425484_3121235449629224349_n (1).mp4",
        poster: "/reels/poster2.jpg",
        user: { name: "Kenji", avatar: "https://i.pravatar.cc/100?img=11" },
        caption: "Quick ramen hack you need to try 🍜",
        hashtags: ["#food", "#ramen", "#hack"],
        music: "Lo-fi Beat - FASSounds",
        liked: true,
        likes: 5342,
        comments: 241,
    },
];

function Reel({ data, isActive, onRequestPrev, onRequestNext }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isLiked, setIsLiked] = useState(!!data.liked);
    const [likeCount, setLikeCount] = useState(data.likes || 0);
    const [isSaved, setIsSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);

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
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            <div className="relative shadow-xl" style={{ width: "min(480px, 92vw)", aspectRatio: "6 / 19" }}>
                <video
                    ref={videoRef}
                    src={data.src}
                    poster={data.poster}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    playsInline
                    muted={isMuted}
                    onClick={togglePlay}
                />

                <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between text-white pointer-events-none">
                    <button className="pointer-events-auto bg-black/40 hover:bg-black/60 rounded-full px-3 py-2" onClick={onRequestPrev}><FaChevronLeft /></button>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full text-sm"><span>Reels</span></div>
                    <button className="pointer-events-auto bg-black/40 rounded-full p-2"><FaEllipsisH /></button>
                </div>

                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white">
                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3" onClick={handleLike}>{isLiked ? <FaHeart /> : <FaRegHeart />}</button>
                    <div className="text-xs opacity-90">{likeCount.toLocaleString()}</div>
                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3" onClick={() => setShowComments(true)}><FaCommentDots /></button>
                    <div className="text-xs opacity-90">{data.comments}</div>
                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3"><FaShare /></button>
                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3" onClick={() => setIsSaved((s) => !s)}>{isSaved ? <FaBookmark /> : <FaRegBookmark />}</button>
                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3" onClick={toggleMute}>{isMuted ? <FaVolumeMute /> : <FaVolumeUp />}</button>
                    <button className="bg-black/40 hover:bg-black/60 rounded-full p-3" onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <BootstrapImage src={data.user.avatar} roundedCircle width={40} height={40} alt={data.user.name} />
                        <div className="font-semibold">{data.user.name}</div>
                        <span className="text-xs opacity-80">• 2h ago</span>
                        <button className="ml-2 text-sm bg-white text-black rounded-full px-3 py-1">Follow</button>
                    </div>
                    <div className="text-sm leading-snug whitespace-pre-wrap">{data.caption} {data.hashtags?.map(h => (<span key={h} className="opacity-80 mr-1">{h}</span>))}</div>
                    {data.music && (<div className="mt-1 flex items-center gap-2 text-sm opacity-90"><FaMusic /> <span>{data.music}</span></div>)}
                </div>

                <Modal show={showComments} onHide={() => setShowComments(false)} centered>
                    <Modal.Header closeButton><Modal.Title>Bình luận</Modal.Title></Modal.Header>
                    <Modal.Body><div className="text-sm text-muted">(Giả lập) Hiển thị bình luận và nhập bình luận.</div></Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowComments(false)}>Đóng</Button><Button variant="primary">Gửi</Button></Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default function ReelsPage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [reels, setReels] = useState(MOCK_REELS);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newReel, setNewReel] = useState({ src: "", poster: "", name: "", avatar: "", caption: "", hashtags: "", music: "" });

    const goPrev = () => setActiveIndex(i => Math.max(0, i - 1));
    const goNext = () => setActiveIndex(i => Math.min(reels.length - 1, i + 1));

    const handleAddReel = () => {
        const id = `mock_${Date.now()}`;
        const tags = newReel.hashtags.split(/\s+/).filter(Boolean);
        const reel = {
            id,
            src: newReel.src || "/reels/sample.mp4",
            poster: newReel.poster || "/reels/sample.jpg",
            user: { name: newReel.name || "Anonymous", avatar: newReel.avatar || "https://i.pravatar.cc/100" },
            caption: newReel.caption || "",
            hashtags: tags,
            music: newReel.music,
            liked: false,
            likes: 0,
            comments: 0,
        };
        setReels(prev => [...prev, reel]);
        setActiveIndex(reels.length);
        setShowAddModal(false);
        setNewReel({ src: "", poster: "", name: "", avatar: "", caption: "", hashtags: "", music: "" });
    };

    return (
        <div className="relative h-screen w-full bg-black text-white overflow-hidden">
            <Reel key={reels[activeIndex]?.id} data={reels[activeIndex]} isActive={true} onRequestPrev={goPrev} onRequestNext={goNext} />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
                <div className="hidden" />
                <div className="flex flex-col items-center gap-3 pointer-events-auto">
                    <button className="bg-white/10 hover:bg-white/20 rounded-full p-3 backdrop-blur-md" onClick={goPrev} disabled={activeIndex === 0}><FaChevronUp /></button>
                    <button className="bg-white/10 hover:bg-white/20 rounded-full p-3 backdrop-blur-md" onClick={goNext} disabled={activeIndex === reels.length - 1}><FaChevronDown /></button>
                </div>
            </div>

            <button onClick={() => setShowAddModal(true)} className="absolute bottom-6 right-6 bg-[var(--primary-color,#0d6efd)] text-white rounded-full p-4 shadow-lg hover:opacity-90"><FaPlus /></button>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Thêm Reel mới</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2"><Form.Label>Video URL</Form.Label><Form.Control value={newReel.src} onChange={e => setNewReel({ ...newReel, src: e.target.value })} /></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>Poster URL</Form.Label><Form.Control value={newReel.poster} onChange={e => setNewReel({ ...newReel, poster: e.target.value })} /></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>Tên người đăng</Form.Label><Form.Control value={newReel.name} onChange={e => setNewReel({ ...newReel, name: e.target.value })} /></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>Avatar URL</Form.Label><Form.Control value={newReel.avatar} onChange={e => setNewReel({ ...newReel, avatar: e.target.value })} /></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>Caption</Form.Label><Form.Control value={newReel.caption} onChange={e => setNewReel({ ...newReel, caption: e.target.value })} /></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>Hashtags (cách nhau bởi khoảng trắng)</Form.Label><Form.Control value={newReel.hashtags} onChange={e => setNewReel({ ...newReel, hashtags: e.target.value })} /></Form.Group>
                        <Form.Group className="mb-2"><Form.Label>Nhạc</Form.Label><Form.Control value={newReel.music} onChange={e => setNewReel({ ...newReel, music: e.target.value })} /></Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button><Button variant="primary" onClick={handleAddReel}>Thêm</Button></Modal.Footer>
            </Modal>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs opacity-70">{activeIndex + 1}/{reels.length}</div>
        </div>
    );
}
