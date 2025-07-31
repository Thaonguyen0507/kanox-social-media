import React from "react";
import { Spinner } from "react-bootstrap";
import useSingleMedia from "../../hooks/useSingleMedia";

const UserAvatar = ({ userId, username, size = 48 }) => {
    const { mediaUrl, loading } = useSingleMedia(userId, "PROFILE", "image");

    return (
        <div className={`w-[${size}px] h-[${size}px] flex items-center justify-center`}>
            {loading ? (
                <Spinner animation="border" size="sm" />
            ) : (
                <img
                    src={mediaUrl || `https://placehold.co/${size}x${size}`}
                    alt={username}
                    className={`w-[${size}px] h-[${size}px] rounded-full object-cover shadow-sm hover:scale-105 transition-transform duration-200`}
                />
            )}
        </div>
    );
};

export default UserAvatar;
