import React, { useState } from "react";
import CommunityLayout from "../../components/layout/Layout/CommunityLayout";
import { useNavigate } from "react-router-dom";

export default function GroupReportsWrapper({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
    const navigate = useNavigate();

    const handleToggleDarkMode = () => {
        const newTheme = isDarkMode ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        setIsDarkMode(!isDarkMode);
    };

    const handleSelectView = (view) => {
        navigate("/communities");
    };

    return (
        <CommunityLayout
            selectedView="feed"
            onSelectView={handleSelectView}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
        >
            {/* Truyền children (GroupReportsPage) */}
            {children}
        </CommunityLayout>
    );
}
