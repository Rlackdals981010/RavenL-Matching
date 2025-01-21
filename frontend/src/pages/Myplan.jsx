import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Myplan.css";
import "./Home.css";
import homeOn from "../assets/home-on.png";
import homeOff from "../assets/home-off.png";
import chatOn from "../assets/chat-on.png";
import chatOff from "../assets/chat-off.png";
import mypageIcon from "../assets/mypage.png";

const PlanAndPayment = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [showMyPagePopup, setShowMyPagePopup] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 구독 상태 조회 함수
        const fetchSubscriptionStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(
                    "http://localhost:5001/payment/subscription/status",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch subscription status.");
                }

                const data = await response.json();
                setSubscriptionStatus(data);
            } catch (error) {
                console.error("Error fetching subscription status:", error);
            }
        };

        fetchSubscriptionStatus();
    }, []);

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
                <div className="plan-content">
                    <h2>Plan & Payment</h2>
                    {subscriptionStatus ? (
                        <div className="plan-details">
                            <div className="plan-row">
                                <div className="plan-info">
                                    <span className="plan-label">Your Plan</span>
                                    <span className="plan-value">
                                        {subscriptionStatus.plan || "Free"}
                                    </span>
                                </div>
                                <button className="plan-upgrade-button">Upgrade</button>
                            </div>
                            <div className="plan-row">
                                <div className="plan-info">
                                    <span className="plan-label">Next Payment Date</span>
                                    <span className="plan-value next-payment-value">
                                        {subscriptionStatus.localStatus === "CANCELED"
                                            ? "No Payment Scheduled" // CANCELED 상태일 경우 표시
                                            : subscriptionStatus.endDate
                                                ? new Date(subscriptionStatus.endDate).toLocaleDateString()
                                                : "N/A"}
                                    </span>
                                </div>
                                <button className="plan-stop-button">Stop</button>
                            </div>
                        </div>
                    ) : (
                        <div className="plan-details">
                            <div className="plan-row">
                                <div className="plan-info">
                                    <span className="plan-label">Your Plan</span>
                                    <span className="plan-value">Free</span>
                                </div>
                                <button className="plan-upgrade-button">Upgrade</button>
                            </div>
                            <div className="plan-row">
                                <div className="plan-info">
                                    <span className="plan-label">Next Payment Date</span>
                                    <span className="plan-value next-payment-value">N/A</span>
                                </div>
                                <button className="plan-stop-button">Stop</button>
                            </div>
                        </div>
                    )}
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

export default PlanAndPayment;