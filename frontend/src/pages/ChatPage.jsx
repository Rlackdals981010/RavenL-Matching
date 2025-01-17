import React, { useState, useEffect } from "react";
import ChatList from "./ChatList";
import Chat from "./Chat";
import "./ChatPage.css";
import "./Home.css"; // 상단바와 사이드바 스타일
import mypageIcon from "../assets/mypage.png"; // 마이페이지 아이콘

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showMyPagePopup, setShowMyPagePopup] = useState(false); // 팝업 표시 상태
  const [userInfo, setUserInfo] = useState({
    name: "User Name",
    email: "user@example.com",
  }); // 사용자 정보 (예시)

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); // JWT 토큰 제거
    window.location.href = "/auth"; // 로그인 페이지로 이동
  };

  return (
    <div className="home-container">
      {/* 상단 바 */}
      <div className="home-header">
        <div className="home-logo">TravWorlds</div>
        <div>
          
          {/* 마이페이지 팝업 버튼 */}
          <div className="mypage-container">
            <button
              className="home-mypage-button"
              onClick={() => setShowMyPagePopup((prev) => !prev)}
            >
              <img src={mypageIcon} alt="My Page" className="mypage-icon" />
            </button>
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
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="home-content">
        {/* 사이드바 */}
        <div className="home-sidebar">
          <a href="/" className="home-sidebar-link">
            <span className="home-sidebar-text">Home</span>
          </a>
          <a href="/chat" className="home-sidebar-link active">
            <span className="home-sidebar-text">Chat</span>
          </a>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="home-main-content">
          <div className="chat-page-container">
            <ChatList onRoomSelect={handleRoomSelect} />
            {selectedRoomId ? (
              <Chat roomId={selectedRoomId} />
            ) : (
              <div className="chat-placeholder">채팅방을 선택하세요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;