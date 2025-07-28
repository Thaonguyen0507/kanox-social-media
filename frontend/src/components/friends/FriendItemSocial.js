import React from "react";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import useMedia from "../../hooks/useMedia";
import FriendshipButton from "../friendship/FriendshipButton";
import FollowActionButton from "../utils/FollowActionButton";

function FriendItemSocial({ user, showActions, handleAccept, handleReject, onAction }) {
    const { mediaUrl: avatarUrl, loading: mediaLoading } = useMedia(user.id, "PROFILE", "image");

    return (
        <div className="flex justify-between items-center gap-4 px-4 py-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4">
                <Link to={`/profile/${user.username}`}>
                    {mediaLoading ? (
                        <Spinner animation="border" size="sm" />
                    ) : (
                        <img
                            src={avatarUrl || "https://placehold.co/48x48"}
                            alt={user.displayName || user.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    )}
                </Link>
                <div>
                    <Link
                        to={`/profile/${user.username}`}
                        className="text-base font-semibold text-black dark:text-white hover:underline"
                    >
                        {user.displayName || user.username}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                    {user.reasonText && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.reasonText}</p>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                {showActions ? (
                    <>
                        <button
                            onClick={() => handleAccept(user.id)}
                            className="px-4 py-1 text-sm font-medium rounded-full border border-black dark:border-white text-black dark:text-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                        >
                            Chấp nhận
                        </button>
                        <button
                            onClick={() => handleReject(user.id)}
                            className="px-4 py-1 text-sm font-medium rounded-full border border-gray-400 text-gray-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
