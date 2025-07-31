import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const EmojiContext = createContext();

export const EmojiProvider = ({ children }) => {
    const [emojiMainList, setEmojiMainList] = useState([]);
    const [emojiMap, setEmojiMap] = useState({});
    const [emojiMessagingList, setEmojiMessagingList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchEmojiData = async () => {
            try {
                if (!token) return;

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                // Fetch emoji-main-list
                const mainRes = await fetch(`${process.env.REACT_APP_API_URL}/reactions/emoji-main-list`, {
                    headers,
                });

                if (!mainRes.ok) throw new Error("Không thể lấy danh sách emoji chính.");
                const mainData = await mainRes.json();
                setEmojiMainList(mainData);

                const map = {};
                mainData.forEach((e) => {
                    map[e.name] = e;
                });
                setEmojiMap(map);

                // Fetch emoji-messaging list
                const msgRes = await fetch(`${process.env.REACT_APP_API_URL}/reactions/messaging`, {
                    headers,
                });

                if (!msgRes.ok) throw new Error("Không thể lấy danh sách emoji tin nhắn.");
                const msgData = await msgRes.json();
                setEmojiMessagingList(msgData);

            } catch (err) {
                console.error("[EmojiContext] Lỗi:", err);
                setError(err.message || "Lỗi khi lấy danh sách emoji.");
                toast.error(err.message || "Lỗi khi lấy emoji.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmojiData();
    }, [token]);

    return (
        <EmojiContext.Provider
            value={{
                emojiMainList,
                emojiMap,
                emojiMessagingList,
                loading,
                error,
            }}
        >
            {children}
        </EmojiContext.Provider>
    );
};

export const useEmojiContext = () => useContext(EmojiContext);
