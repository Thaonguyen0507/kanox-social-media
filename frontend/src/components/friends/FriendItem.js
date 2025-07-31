import React from "react";
import { Image, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import useSingleMedia from "../../hooks/useSingleMedia";
import FriendshipButton from "../friendship/FriendshipButton";
import FollowActionButton from "../utils/FollowActionButton";

function FriendItem({ user, showActions, handleAccept, handleReject, onAction }) {
    const { mediaUrl: avatarUrl, loading: mediaLoading } = useSingleMedia(user.id, "PROFILE", "image");

    const renderAvatar = () => {
        if (mediaLoading) {
            return <Spinner animation="border" size="sm" className="me-3 mt-1" />;
        }
        return (
            <Image
                src={avatarUrl || "https://placehold.co/50x50"}
                alt={user.displayName || user.username}
                roundedCircle
                className="w-[50px] h-[50px] object-cover border border-[var(--border-color)]"
            />
        );
    };

    return (
        <div
            className="group flex flex-col py-4 border-b last:border-b-0 px-4 relative"
            style={{ borderColor: "var(--border-color)" }}
        >
            {/* User Info */}
            <div className="flex items-center gap-3">
                <div className="relative shrink-0 group">
                    <Link to={`/profile/${user.username}`}>
                        {renderAvatar()}
                    </Link>

                    {/* Mutual Friends Tooltip */}
                    {user.reason === "mutual_friends" && user.mutualFriends?.length > 0 && (
                        <div
                            className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs rounded-md p-2 shadow-lg mt-2 z-10 max-w-[200px] w-max"
                            style={{
                                top: "100%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                                border: "1px solid var(--border-color)",
                                whiteSpace: "normal",
                                pointerEvents: "none",
                            }}
                        >
                            Bạn chung:{" "}
                            {user.mutualFriends.slice(0, 5).map((friend, index) => (
                                <React.Fragment key={friend.id}>
                                    {index > 0 && ", "}
                                    <Link
                                        to={`/profile/${friend.username}`}
                                        className="hover:underline"
                                        style={{ color: "var(--primary-color)" }}
                                    >
                                        {friend.displayName || friend.username}
                                    </Link>
                                </React.Fragment>
                            ))}
                            {user.mutualFriends.length > 5 &&
                                ` và ${user.mutualFriends.length - 5} người khác`}
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <Link
                        to={`/profile/${user.username}`}
                        className="font-semibold text-base hover:underline"
                        style={{ color: "var(--text-color)" }}
                    >
                        {user.displayName || user.username}
                    </Link>
                    <p className="text-sm text-muted">@{user.username}</p>
                    {user.reasonText && (
                        <p className="text-sm text-muted">{user.reasonText}</p>
                    )}
                </div>
            </div>

            {/* Mutual Friends Tooltip */}

            {/* Actions */}
            <div className="flex justify-center gap-2 mt-3">
                {showActions ? (
                    <>
                        <button
                            onClick={() => handleAccept(user.id)}
                            className="rounded-full px-4 py-1 text-sm font-medium hover-bg-dark border"
                            style={{
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                                borderColor: "var(--text-color)",
                            }}
                        >
                            Chấp nhận
                        </button>
                        <button
                            onClick={() => handleReject(user.id)}
                            className="rounded-full px-4 py-1 text-sm font-medium hover-bg-dark border"
                            style={{
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color-muted)",
                                borderColor: "var(--border-color)",
                            }}
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
