import React, { useState, useEffect } from "react";
import "./ChatList.css";

const ChatList = ({ onRoomSelect }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5001/chat/rooms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      })
      .catch((err) => console.error("Failed to fetch rooms:", err));
  }, []);

  return (
    <div className="chat-list-container">
      <div className="chat-header">
        <h2>Chat</h2>
        <input
          type="text"
          className="chat-search"
          placeholder="검색 대상"
        />
      </div>
      <ul className="room-list">
        {rooms.map((room) => (
          <li
            key={room._id}
            className="room-item"
            onClick={() => onRoomSelect(room.roomId)} // 선택된 방 ID 전달
          >
            <div className="room-info">
              <div className="room-name">Room: {room.roomId}</div>
              <div className="room-last-message">
                {room.participants.join(", ")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;