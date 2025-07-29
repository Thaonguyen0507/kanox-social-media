import React from "react";
import { FaUserCircle } from "react-icons/fa";
import moment from "moment";
import useCommentAvatar from "../../../hooks/useCommentAvatar";
import { useSpring, animated } from "react-spring";

const CommentItem = ({ comment }) => {
    const { avatarUrl } = useCommentAvatar(comment?.user?.id);

    const avatarSpring = useSpring({ scale: 1 });
    const mediaSpring = useSpring({ transform: "scale(1)" });

    return (
        <div className="flex gap-3 mb-4 w-full hover-card p-2 rounded-lg transition-all">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <animated.div
                    style={avatarSpring}
                    onMouseEnter={() => avatarSpring.scale.start(1.05)}
                    onMouseLeave={() => avatarSpring.scale.start(1)}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="w-9 h-9 rounded-full object-cover border border-dark"
                        />
                    ) : (
                        <FaUserCircle size={36} className="text-muted" />
                    )}
                </animated.div>
            </div>

            {/* Nội dung comment */}
            <div className="flex-grow min-w-0">
                <div className="bg-[var(--comment-bg-color)] p-3 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-dark">
                            {comment?.user?.displayName || "Người dùng"}
                        </span>
                        <span className="text-xs text-muted">
                            {moment(comment.createdAt * 1000).fromNow()}
                        </span>
                    </div>

                    <div className="text-sm text-dark leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </div>

                    {/* Media */}
                    {comment.media?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {comment.media.map((media, index) => {
                                const isImage = media.type === "image" || media.type === "gif";
                                const isVideo = media.type === "video";
                                const isAudio = media.type === "audio";

                                return (
                                    <animated.div
                                        key={index}
                                        className="rounded-lg overflow-hidden transition-transform"
                                        style={mediaSpring}
                                        onMouseEnter={() => mediaSpring.transform.start("scale(1.02)")}
                                        onMouseLeave={() => mediaSpring.transform.start("scale(1)")}
                                    >
                                        {isImage && (
                                            <img
                                                src={media.url}
                                                alt={`media-${index}`}
                                                className="w-32 h-auto max-w-[200px] max-h-[200px] rounded-lg object-cover"
                                            />
                                        )}
                                        {isVideo && (
                                            <video
                                                controls
                                                className="w-48 max-h-[200px] rounded-lg object-cover"
                                            >
                                                <source src={media.url} type="video/mp4" />
                                                Trình duyệt không hỗ trợ video.
                                            </video>
                                        )}
                                        {isAudio && (
                                            <audio controls className="w-full max-w-[200px] rounded-lg">
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