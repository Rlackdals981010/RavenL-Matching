import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatList.css";

const ChatList = () => {
  const [rooms, setRooms] = useState([]); // 방 목록 상태
  const navigate = useNavigate();

  useEffect(() => {
    // 로컬 스토리지에서 JWT 토큰 가져오기
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No JWT token found. Please log in.");
      return;
    }

    // 현재 사용자가 속한 방 목록 조회
    fetch("http://localhost:5001/chat/rooms", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // JWT 토큰 추가
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch rooms");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched rooms:", data); // 응답 데이터 확인
        setRooms(data); // 방 목록 상태 업데이트
      })
      .catch((err) => {
        console.error("Failed to fetch rooms:", err);
      });
  }, []);

  const handleRoomClick = (roomId) => {
    navigate(`/chat/${roomId}`); // 방 클릭 시 해당 방으로 이동
  };

  return (
    <div className="chat-list-container">
      <h1>My Chat Rooms</h1>
      {rooms.length > 0 ? (
        <ul className="room-list">
          {rooms.map((room) => (
            <li
              key={room._id} // 방 고유 ID를 키로 사용
              className="room-item"
              onClick={() => handleRoomClick(room.roomId)}
            >
              <strong>Room ID:</strong> {room.roomId} <br />
              <strong>Participants:</strong> {room.participants.join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <p>No rooms found.</p>
      )}
    </div>
  );
};

export default ChatList;