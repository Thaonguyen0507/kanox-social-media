import React, { useRef, useState } from "react";
import { Overlay, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import { FaImage, FaSmile } from "react-icons/fa";
import useEmojiList from "../../hooks/useEmojiList";

const MediaActionBar = ({ onEmojiClick, onFileSelect, onSelectEmoji }) => {
    const fileInputRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { emojiList } = useEmojiList();

    const handleClickFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) onFileSelect(files);
    };

    const handleEmojiToggle = () => {
        setShowEmojiPicker((prev) => !prev);
        onEmojiClick?.();
    };

    const handleSelectEmoji = (emoji) => {
        onSelectEmoji?.(emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="relative flex items-center gap-4 px-2 py-1">
            {/* Emoji Icon */}
            <OverlayTrigger placement="top" overlay={<Tooltip>Biểu cảm</Tooltip>}>
                <button
                    type="button"
                    ref={emojiButtonRef}
                    onClick={handleEmojiToggle}
                    className="text-xl text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition-colors duration-150 focus:outline-none"
                >
                    <FaSmile />
                </button>
            </OverlayTrigger>

            {/* Emoji Picker */}
            <Overlay
                target={emojiButtonRef.current}
                show={showEmojiPicker}
                placement="top"
                rootClose
                onHide={() => setShowEmojiPicker(false)}
            >
                {(props) => (
                    <Popover
                        {...props}
                        className="z-50 rounded-lg shadow-lg border border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-600"
                    >
                        <Popover.Body className="max-w-[300px] max-h-[200px] overflow-y-auto scrollbar-hide p-2">
                            <div className="flex flex-wrap">
                                {emojiList.map((emoji, idx) => (
                                    <span
                                        key={idx}
                                        onClick={() => handleSelectEmoji(emoji)}
                                        className="text-2xl cursor-pointer m-1 hover:scale-110 transition-transform"
                                    >
                                        {emoji.emoji}
                                    </span>
                                ))}
                            </div>
                        </Popover.Body>
                    </Popover>
                )}
            </Overlay>

            {/* Image / Video Upload */}
            <OverlayTrigger placement="top" overlay={<Tooltip>Hình ảnh / Video</Tooltip>}>
                <button
                    type="button"
                    onClick={handleClickFileInput}
                    className="text-xl text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition-colors duration-150 focus:outline-none"
                >
                    <FaImage />
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </button>
            </OverlayTrigger>
        </div>
    );
};

export default MediaActionBar;
