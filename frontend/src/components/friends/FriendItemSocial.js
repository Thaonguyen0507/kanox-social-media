import React from "react";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import useMedia from "../../hooks/useMedia";
import FriendshipButton from "../friendship/FriendshipButton";
import FollowActionButton from "../utils/FollowActionButton";

function FriendItemSocial({ user, showActions, handleAccept, handleReject, onAction }) {
    const { mediaUrl: avatarUrl, loading: mediaLoading } = useMedia(user.id, "PROFILE", "image");

    return (
        <div className="flex justify-between items-center gap-4 px-4 py-3 rounded-xl hover:bg-[var(--hover-bg-color)] transition-all duration-200 shadow-sm">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4">
                <Link to={`/profile/${user.username}`}>
                    <div className="w-12 h-12 flex items-center justify-center">
                        {mediaLoading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <img
                                src={avatarUrl || "https://placehold.co/48x48"}
                                alt={user.displayName || user.username}
                                className="w-12 h-12 rounded-full object-cover shadow-sm hover:scale-105 transition-transform duration-200"
                            />
                        )}
                    </div>
                </Link>
                <div className="flex flex-col">
                    <Link
                        to={`/profile/${user.username}`}
                        className="text-base font-semibold text-[var(--text-color)] transition-opacity duration-150 hover:opacity-80"
                    >
                        {user.displayName || user.username}
                    </Link>
                    <p className="text-sm text-[var(--text-color-muted)]">@{user.username}</p>
                    {user.reasonText && (
                        <p className="text-xs text-[var(--text-color-muted)] mt-1 italic">{user.reasonText}</p>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                {showActions ? (
                    <>
                        <button
                            onClick={() => handleAccept(user.id)}
                            className="px-4 py-1 text-sm font-medium rounded-full border border-[var(--text-color)] text-[var(--text-color)] bg-transparent hover:bg-[var(--text-color)] hover:text-white dark:hover:text-black dark:hover:bg-white transition-all duration-200 shadow-sm"
                        >
                            Chấp nhận
                        </button>
                        <button
                            onClick={() => handleReject(user.id)}
                            className="px-4 py-1 text-sm font-medium rounded-full border border-[var(--text-color-muted)] text-[var(--text-color-muted)] bg-transparent hover:bg-[var(--hover-bg-color)] transition-all duration-200 shadow-sm"
                        >
                            Từ chối
                        </button>
                    </>
                ) : (
                    <>
                        <FriendshipButton targetId={user.id} onAction={onAction} />
                        <FollowActionButton targetId={user.id} />
                    </>
                )}
            </div>
        </div>
    );
}

export default FriendItemSocial;
