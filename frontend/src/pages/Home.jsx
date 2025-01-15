import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import homeOn from "../assets/home-on.png";
import homeOff from "../assets/home-off.png";
import chatOn from "../assets/chat-on.png";
import chatOff from "../assets/chat-off.png";
import sendIcon from "../assets/send.png";
import mypageIcon from "../assets/mypage.png";
import { parseJWT } from "../utils/jwt"; // parseJWT 가져오기

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [inputValue, setInputValue] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false); // 로그인 팝업 상태
  const [showMyPagePopup, setShowMyPagePopup] = useState(false); // MyPage 팝업 상태
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsLoggedIn(true);
      const parsedToken = parseJWT(token); // JWT 파싱
      if (parsedToken) {
        setUserInfo({
          name: parsedToken.name || "Unknown",
          email: parsedToken.email || "No Email",
        });
      }
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const handleMyPageClick = () => {
    setShowMyPagePopup(!showMyPagePopup);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    setIsLoggedIn(false);
    setShowMyPagePopup(false);
  };

  const handleSendClick = () => {
    if (!isLoggedIn) {
      setShowLoginPopup(true); // 로그인 팝업 표시
    } else {
      console.log("Message sent:", inputValue);
    }
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false); // 로그인 팝업 닫기
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-logo">TravWorlds</h1>
        {isLoggedIn ? (
          <button className="home-mypage-button" onClick={handleMyPageClick}>
            <img
              src={mypageIcon}
              alt="MyPage"
              className="home-mypage-icon"
              style={{ width: "33px", height: "33px", marginRight: "8px" }}
            />
          </button>
        ) : (
          <button className="home-login-button" onClick={handleLoginClick}>
            Sign in
          </button>
        )}
      </header>

      <div className="home-content">
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

        <div className="home-main-content">
          <div className="home-content-box">
            <h2 className="home-content-title">Hi!</h2>
            <p className="home-content-subtitle">
              I'll give you matching information with AI
            </p>
            <div className="home-input-container">
              <input
                type="text"
                placeholder="Send a message"
                className="home-message-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button className="home-send-button" onClick={handleSendClick}>
                <img src={sendIcon} alt="Send" className="home-send-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 팝업 */}
      {showLoginPopup && (
        <div className="home-popup-overlay" onClick={closeLoginPopup}>
          <div className="home-popup" onClick={(e) => e.stopPropagation()}>
            <p className="home-popup-message">Please sign in to continue.</p>
            <button
              className="home-popup-login-button"
              onClick={handleLoginClick}
            >
              Sign in
            </button>
          </div>
        </div>
      )}

      {/* MyPage 팝업 */}
      {showMyPagePopup && (
        <div className="mypage-popup">
          <div className="mypage-header">
            <img
              src={mypageIcon}
              alt="Profile"
              className="mypage-profile-icon"
            />
            <div>
              <p className="mypage-name">{userInfo.name}</p>
              <p className="mypage-email">{userInfo.email}</p>
            </div>
          </div>
          <ul className="mypage-list">
            <li className="mypage-item">Account & Settings</li>
            <li className="mypage-item">Plan & Payment</li>
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

export default HomePage;