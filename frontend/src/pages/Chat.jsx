import React, { useState, useEffect, useRef } from "react";
import socket from "../server";
import "./Chat.css";
import chatPersion from "../assets/chat-person.png"; // 프로필 아이콘

const Chat = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [userId, setUserId] = useState(null); // 현재 사용자의 ID
  const chatContainerRef = useRef(null); // 스크롤을 제어할 ref

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded JWT payload:", payload);
        setUserId(payload.id);
      } catch (error) {
        console.error("Invalid JWT token:", error);
      }
    }

    socket.emit("joinRoom", roomId, (response) => {
      if (response.success) {
        setChat(response.messages);
      }
    });

    socket.on("receiveMessage", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId]);

  // 새로운 메시지가 추가될 때마다 자동으로 스크롤 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = () => {
    if (message && roomId) {
      socket.emit("sendMessage", { roomId, message }, (response) => {
        if (response.success) {
          console.log("Message sent successfully.");
        }
      });
      setMessage("");
    }
  };

  return (
    <div className="chat-room-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${String(msg.senderId) === String(userId)
              ? "chat-message-right"
              : "chat-message-left"
              }`}
          >
            {String(msg.senderId) !== String(userId) && (
              <div className="chat-profile">
                <img
                  src={chatPersion}
                  alt="Profile"
                  className="chat-profile-icon"
                />
              </div>
            )}
            <div className="chat-bubble-container">

              <div
                className={`chat-row ${String(msg.senderId) === String(userId)
                    ? "chat-row-right"
                    : "chat-row-left"
                  }`}
              >
                <div className="chat-bubble">
                  <p>{msg.message}</p>
                </div>
                <div className="chat-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="chat-input"
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={sendMessage} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;