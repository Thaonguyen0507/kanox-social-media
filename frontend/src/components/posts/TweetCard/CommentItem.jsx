import React from "react";
import { FaUserCircle } from "react-icons/fa";
import moment from "moment";
import useCommentAvatar from "../../../hooks/useCommentAvatar";
import { useSpring, animated } from "react-spring";

const CommentItem = ({ comment }) => {
    const { avatarUrl } = useCommentAvatar(comment?.user?.id);

    // Animation cho avatar khi hover
    const avatarAnimation = useSpring({
        scale: avatarUrl ? 1.05 : 1,
        config: { tension: 300, friction: 10 },
    });

    // Animation cho media khi hover
    const mediaAnimation = useSpring({
        transform: "scale(1)",
        config: { tension: 300, friction: 10 },
    });

    return (
        <div className="flex gap-3 mb-4 w-full transition-all duration-200 hover:bg-[var(--hover-bg-color-light)] p-2 rounded-lg">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <animated.div
                    style={avatarAnimation}
                    onMouseEnter={() => avatarUrl && avatarAnimation.scale.set(1.05)}
                    onMouseLeave={() => avatarUrl && avatarAnimation.scale.set(1)}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="w-9 h-9 rounded-full object-cover border border-[var(--border-color)]"
                        />
                    ) : (
                        <FaUserCircle
                            size={36}
                            className="text-[var(--text-color-muted)]"
                            aria-label="Ảnh đại diện mặc định"
                        />
                    )}
                </animated.div>
            </div>

            {/* Nội dung comment */}
            <div className="flex-grow min-w-0">
                <div className="bg-[var(--hover-bg-color)] p-3 rounded-2xl break-words text-[var(--text-color)] shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-[var(--text-color)]">
              {comment?.user?.displayName || "Người dùng"}
            </span>
                        <span className="text-xs text-[var(--text-color-muted)]">
              {moment(comment.createdAt * 1000).fromNow()}
            </span>
                    </div>

                    <div className="text-sm leading-relaxed">{comment.content}</div>

                    {comment.media?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {comment.media.map((media, index) => {
                                const isImage = media.type === "image" || media.type === "gif";
                                const isVideo = media.type === "video";
                                const isAudio = media.type === "audio";

                                return (
                                    <animated.div
                                        key={index}
                                        className="rounded-lg overflow-hidden"
                                        style={mediaAnimation}
                                        onMouseEnter={() => mediaAnimation.transform.set("scale(1.02)")}
                                        onMouseLeave={() => mediaAnimation.transform.set("scale(1)")}
                                    >
                                        {isImage && (
                                            <img
                                                src={media.url}
                                                alt={`media-${index}`}
                                                className="w-32 h-auto max-w-[200px] max-h-[200px] rounded-lg object-cover transition-transform duration-200"
                                            />
                                        )}
                                        {isVideo && (
                                            <video
                                                controls
                                                className="w-48 max-h-[200px] rounded-lg object-cover transition-transform duration-200"
                                            >
                                                <source src={media.url} type="video/mp4" />
                                                Trình duyệt không hỗ trợ video.
                                            </video>
                                        )}
                                        {isAudio && (
                                            <audio
                                                controls
                                                className="w-full max-w-[200px] rounded-lg"
                                            >
                                                <source src={media.url} type="audio/mpeg" />
                                                Trình duyệt không hỗ trợ audio.
                                            </audio>
                                        )}
                                    </animated.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;