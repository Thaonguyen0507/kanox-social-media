import React, { useEffect, useRef, useState, useMemo } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaRegHeart } from "react-icons/fa";
import useReaction from "../../../hooks/useReaction";
import { useEmojiContext } from "../../../context/EmojiContext";
import { toast } from "react-toastify";
import { useSpring, animated } from "react-spring";

function ReactionButtonGroup({ user, targetId, targetTypeCode, initialReactionCountMap = {} }) {
    const memoizedReactionCountMap = useMemo(() => initialReactionCountMap, [initialReactionCountMap]);
    const [showPopover, setShowPopover] = useState(false);
    const hoverTimeout = useRef(null);
    const ref = useRef();

    const {
        currentEmoji,
        reactionCountMap,
        sendReaction,
        removeReaction,
    } = useReaction({
        user,
        targetId,
        targetTypeCode,
        initialReactionCountMap: memoizedReactionCountMap,
    });
    const { emojiMainList: mainEmojiList = [], emojiMap = {} } = useEmojiContext();

    const totalCount = Object.values(reactionCountMap).reduce((sum, count) => sum + count, 0);

    // Animation cho popover
    const popoverAnimation = useSpring({
        opacity: showPopover ? 1 : 0,
        transform: showPopover ? "translateY(0)" : "translateY(-10px)",
        config: { tension: 220, friction: 20 },
    });

    const handleEmojiClick = async (name) => {
        const emoji = emojiMap?.[name];
        if (!emoji) {
            toast.error("Biểu cảm không hợp lệ hoặc chưa tải.");
            return;
        }

        if (currentEmoji?.name === name) {
            await removeReaction();
        } else {
            await sendReaction(name);
        }
        setShowPopover(false);
    };

    const handleMouseEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => setShowPopover(true), 300);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => setShowPopover(false), 300);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setShowPopover(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            clearTimeout(hoverTimeout.current);
        };
    }, []);

    return (
        <div
            className="reaction-wrapper relative"
            ref={ref}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button
                variant="link"
                className="text-[var(--text-color-muted)] p-2 rounded-full hover:bg-gray-100 hover:text-[var(--primary-color)] transition-colors duration-200 text-decoration-none flex items-center"
                onClick={async () => {
                    if (currentEmoji) {
                        await removeReaction();
                    } else {
                        setShowPopover((prev) => !prev);
                    }
                }}
                aria-label="Chọn biểu cảm"
            >
                {currentEmoji?.emoji || <FaRegHeart size={20} />}
                {totalCount > 0 && (
                    <span className="ml-1 text-sm font-medium text-[var(--text-color)]">
            {totalCount}
          </span>
                )}
            </Button>

            {showPopover && (
                <animated.div
                    style={popoverAnimation}
                    className="reaction-popover bg-[var(--background-color)] rounded-xl p-2 shadow-lg border border-[var(--border-color)] flex gap-2 absolute bottom-10 left-0 z-50"
                >
                    {Array.isArray(mainEmojiList) && mainEmojiList.map((emojiObj) => (
                        <OverlayTrigger
                            key={emojiObj.name}
                            placement="top"
                            overlay={<Tooltip>{emojiObj.name}</Tooltip>}
                        >
              <span
                  className="reaction-emoji cursor-pointer text-2xl hover:scale-125 transition-transform duration-200 text-[var(--text-color)]"
                  onClick={() => handleEmojiClick(emojiObj.name)}
                  role="button"
              >
                {emojiObj.emoji}
              </span>
                        </OverlayTrigger>
                    ))}
                </animated.div>
            )}
        </div>
    );
}

export default ReactionButtonGroup;