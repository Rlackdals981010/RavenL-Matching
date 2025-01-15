import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // URL에서 파라미터 가져오기
import io from "socket.io-client";
import axios from "axios";
import "./ChatRoom.css";

const ChatRoom = () => {
  const { roomId } = useParams(); // URL에서 roomId 가져오기
  const [messages, setMessages] = useState([]); // 메시지 내역
  const [inputValue, setInputValue] = useState(""); // 입력 메시지
  const [userEmail, setUserEmail] = useState(""); // 사용자 이메일
  const socket = io("http://localhost:5001"); // WebSocket 서버 연결

  useEffect(() => {
    // JWT에서 사용자 이메일 가져오기
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.email);
    }

    // 채팅방 메시지 가져오기
    axios
      .get(`http://localhost:5001/chat/rooms/${roomId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));

    // WebSocket 채팅방 참여
    socket.emit("joinRoom", roomId);

    // 서버로부터 메시지 수신
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const message = {
      chatId: roomId,
      sender: userEmail,
      text: inputValue,
    };

    // 메시지 서버로 전송
    socket.emit("sendMessage", message);

    // 낙관적 업데이트
    setMessages((prevMessages) => [...prevMessages, message]);
    setInputValue("");
  };

  return (
    <div className="chat-room-container">
      <h1 className="chat-room-title">Chat Room: {roomId}</h1>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === userEmail ? "sent" : "received"
            }`}
          >
            <strong>{msg.sender === userEmail ? "You" : msg.sender}:</strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;