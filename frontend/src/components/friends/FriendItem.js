import React from "react";
import { Image, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import useMedia from "../../hooks/useMedia";
import FriendshipButton from "../friendship/FriendshipButton";
import FollowActionButton from "../utils/FollowActionButton";

function FriendItem({ user, showActions, handleAccept, handleReject, onAction }) {
    const { mediaUrl: avatarUrl, loading: mediaLoading } = useMedia(user.id, "PROFILE", "image");

    const renderAvatar = () => {
        if (mediaLoading) {
            return <Spinner animation="border" size="sm" className="me-3 mt-1" />;
        }
        return (
            <Image
                src={avatarUrl || "https://placehold.co/40x40"}
                alt={user.displayName || user.username}
                roundedCircle
                className="w-[50px] h-[50px] object-cover"
            />

        );
    };

    return (
        <div className="flex flex-col py-3 border-b last:border-b-0 border-gray-300">
            <div className="flex items-center gap-3">
            <Link to={`/profile/${user.username}`}>
                    {renderAvatar()}
                </Link>
                <div className="flex-grow-1">
                    <Link
                        to={`/profile/${user.username}`}
                        className="text-dark text-decoration-none font-bold"
                    >
                        {user.displayName || user.username}
                    </Link>
                    <p className="text-muted text-sm mb-0">@{user.username}</p>
                    <p className="text-muted text-sm mb-0">{user.reasonText}</p>
                </div>
            </div>
            <div className="flex justify-center gap-2 mt-3">
                {showActions ? (
                    <>
                        <button
                            onClick={() => handleAccept(user.id)}
                            className="rounded-full px-2 py-1 text-sm font-medium border border-black text-black bg-white hover:bg-gray-200 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800"
                        >
                            Chấp nhận
                        </button>
                        <button
                            onClick={() => handleReject(user.id)}
                            className="rounded-full px-2 py-1 text-sm font-medium border border-gray-500 text-gray-500 bg-white hover:bg-gray-200 dark:border-gray-400 dark:text-gray-400 dark:bg-black dark:hover:bg-gray-800"
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

export default FriendItem;