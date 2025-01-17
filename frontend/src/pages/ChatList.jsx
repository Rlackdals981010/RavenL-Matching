import React, { useState, useEffect } from "react";
import "./ChatList.css";
import chatPersion from "../assets/chat-person.png"; // 프로필 아이콘
import search from "../assets/search.png"; // 검색 아이콘

const ChatList = ({ onRoomSelect }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/chat/rooms", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setRooms(data))
      .catch((error) => console.error("Error fetching chat rooms:", error));
  }, []);

  const handleRoomClick = (roomId) => {
    setSelectedRoomId(roomId);
    onRoomSelect(roomId);
  };

  const formatLastMessageTime = (lastMessageTime) => {
    if (!lastMessageTime) return "";

    // 메시지 시간이 오늘인 경우, 시간만 표시 (AM/PM 포함)
    const messageDate = new Date(lastMessageTime);
    const today = new Date();

    const isSameDay =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    if (isSameDay) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // AM/PM 포함
      });
    }

    // 오늘이 아닌 경우, 날짜만 표시
    return messageDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="chat-list-container">
      <h3 className="chat-list-header">Chat</h3>

      {/* 검색 바 */}
      <div className="chat-list-search-container">
        <img src={search} alt="Search" className="chat-list-search-icon" />
        <input
          type="text"
          className="chat-list-search-input"
          placeholder="검색하세요..."
        />
      </div>

      {/* 채팅방 목록 */}
      <ul className="chat-list">
        {rooms.map((room) => (
          <li
            key={room.roomId}
            className={`chat-list-item ${selectedRoomId === room.roomId ? "selected" : ""
              }`}
            onClick={() => handleRoomClick(room.roomId)}
          >
            {/* 왼쪽 섹션 */}
            <div className="chat-list-item-left">
              <img
                src={chatPersion}
                alt="Profile"
                className="chat-list-profile-icon"
              />
              <div className="chat-list-item-content">
                <strong className="chat-list-item-name">
                  {room.otherUserName || `Room ${room.roomId}`}
                  {room.unreadCount > 0 && (
                    <span className="chat-list-unread-dot"></span>
                  )}
                </strong>
                <p className="chat-list-item-last-message">
                  {room.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>

            {/* 오른쪽 섹션 */}
            <div className="chat-list-item-right">
              <span className="chat-list-item-date">
                {room.lastMessageTime || ""}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;