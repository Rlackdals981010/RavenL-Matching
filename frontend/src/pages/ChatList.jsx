import React, { useState, useEffect } from "react";
import "./ChatList.css";

const ChatList = ({ onRoomSelect }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    // Fetch chat rooms from the backend
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
    setSelectedRoomId(roomId); // 선택된 방 ID 설정
    onRoomSelect(roomId); // 부모 컴포넌트에 전달
  };

  return (
    <div className="chat-list-container">
      <h3>Chat</h3>
      <ul className="chat-list">
        {rooms.map((room) => (
          <li
            key={room.roomId}
            className={`chat-list-item ${
              selectedRoomId === room.roomId ? "selected" : ""
            }`}
            onClick={() => handleRoomClick(room.roomId)}
          >
            Room: {room.roomId}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;