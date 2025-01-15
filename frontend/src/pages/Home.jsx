import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import "./Home.css";
import homeOn from "../assets/home-on.png";
import homeOff from "../assets/home-off.png";
import chatOn from "../assets/chat-on.png";
import chatOff from "../assets/chat-off.png";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate(); // useNavigate 초기화

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLoginClick = () => {
    navigate("/auth"); // /auth로 이동
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-logo">TravWorlds</h1>
        <button className="home-login-button" onClick={handleLoginClick}>
          로그인
        </button>
      </header>

      <div className="home-content">
        <div className="home-sidebar">
          {/* Home 버튼 */}
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
          {/* Chat 버튼 */}
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
              />
              <button className="home-send-button">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;