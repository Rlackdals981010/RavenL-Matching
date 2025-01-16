import React, { useState } from "react";
import ChatList from "./ChatList"; // ChatList 컴포넌트
import Chat from "./Chat"; // Chat 컴포넌트
import "./ChatPage.css"; // 스타일 파일

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null); // 선택된 방 ID 상태

  // 방 선택 핸들러
  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
  };

  return (
    <div className="chat-page-container">
      <ChatList onRoomSelect={handleRoomSelect} /> {/* 채팅방 목록 */}
      {selectedRoomId ? (
        <Chat roomId={selectedRoomId} /> // 선택된 방의 채팅 내용 표시
      ) : (
        <div className="chat-placeholder">채팅방을 선택하세요.</div>
      )}
    </div>
  );
};

export default ChatPage;