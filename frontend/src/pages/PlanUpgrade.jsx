import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlanUpgrade.css";
import "./Home.css";
import homeOn from "../assets/home-on.png";
import homeOff from "../assets/home-off.png";
import chatOn from "../assets/chat-on.png";
import chatOff from "../assets/chat-off.png";
import mypageIcon from "../assets/mypage.png";
import { apiFetch } from "../utils/apiFetch"; // apiFetch 추가

const PlanUpgrade = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [showMyPagePopup, setShowMyPagePopup] = useState(false);
    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleMyPageClick = () => {
        setShowMyPagePopup(!showMyPagePopup);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    const handleUpgrade = async () => {
        try {
            const data = await apiFetch("/payment/subscription/create", {
                method: "POST",
                body: JSON.stringify({
                    planId: "YOUR_PLAN_ID", // Plan ID 추가
                }),
            });

            if (data.approvalUrl) {
                window.open(data.approvalUrl, "_blank"); // 새 창에서 승인 URL 열기
            } else {
                alert("Approval URL not found.");
            }
        } catch (error) {
            console.error("Error upgrading subscription:", error.message);
            alert("Failed to upgrade subscription. Please try again.");
        }
    };

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <h1 className="home-logo">TravWorlds</h1>
                <button className="home-mypage-button" onClick={handleMyPageClick}>
                    <img
                        src={mypageIcon}
                        alt="MyPage"
                        className="home-mypage-icon"
                        style={{ width: "33px", height: "33px", marginRight: "8px" }}
                    />
                </button>
            </header>

            <div className="home-content">
                {/* Sidebar */}
                <div className="home-sidebar">
                    <a
                        href="/"
                        className={`home-sidebar-link ${activeTab === "home" ? "active" : ""}`}
                        onClick={() => handleTabClick("home")}
                    >
                        <img
                            src={activeTab === "home" ? homeOn : homeOff}
                            alt="Home"
                            className="home-sidebar-icon"
                        />
                        <span className="home-sidebar-text">Home</span>
                    </a>
                    <a
                        href="/chat"
                        className={`home-sidebar-link ${activeTab === "chat" ? "active" : ""}`}
                        onClick={() => handleTabClick("chat")}
                    >
                        <img
                            src={activeTab === "chat" ? chatOn : chatOff}
                            alt="Chat"
                            className="home-sidebar-icon"
                        />
                        <span className="home-sidebar-text">Chat</span>
                    </a>
                </div>

                {/* Main Content */}
                <div className="plan-upgrade-content">
                    <h2>Plan Pricing</h2>
                    <p>Unlock access to all features and enjoy the full potential of our service.</p>
                    <div className="plan-container">
                        <div className="free-plan-box">
                            <h3 className="plan-title">Starter</h3>
                            <p className="plan-price">
                                FREE <span className="plan-duration">/ per month</span>
                            </p>
                            <button className="current-plan-button">Current Plan</button>
                            <ul className="plan-features">
                                <li>✓ 10 credits</li>
                                <li>✓ 10 credits</li>
                                <li>✓ 10 credits</li>
                                <li>✓ 10 credits</li>
                            </ul>
                        </div>
                        <div className="premium-plan-box">
                            <h3 className="plan-title">Premium</h3>
                            <p className="plan-price">
                                $90 <span className="plan-duration">/ per month</span>
                            </p>
                            <button className="upgrade-button" onClick={handleUpgrade}>
                                Upgrade
                            </button>
                            <ul className="plan-features">
                                <li>✓ 10 credits</li>
                                <li>✓ 10 credits</li>
                                <li>✓ 10 credits</li>
                                <li>✓ 10 credits</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* MyPage Popup */}
            {showMyPagePopup && (
                <div className="mypage-popup">
                    <div className="mypage-header">
                        <img
                            src={mypageIcon}
                            alt="Profile"
                            className="mypage-profile-icon"
                        />
                        <div>
                            <p className="mypage-name">John Doe</p>
                            <p className="mypage-email">johndoe@example.com</p>
                        </div>
                    </div>
                    <ul className="mypage-list">
                        <li className="mypage-item" onClick={() => navigate("/mypage")}>
                            Account & Settings
                        </li>
                        <li className="mypage-item" onClick={() => navigate("/myplan")}>
                            Plan & Payment
                        </li>
                        <li className="mypage-item">Help Center</li>
                        <li className="mypage-item" onClick={handleLogout}>
                            Log out
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PlanUpgrade;