import React, { useState, useEffect } from "react";
import socket from "../server";
import "./Chat.css";

const Chat = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
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

  const sendMessage = () => {
    if (message && roomId) {
      socket.emit("sendMessage", { roomId, message }, (response) => {
        if (response.success) {
          console.log("Message sent successfully.");
        } else {
          console.error("Failed to send message:", response.error);
        }
      });
      setMessage("");
    }
  };

  return (
    <div className="chat-room-container">
      <div className="chat-room-header">
        <h2>Room: {roomId}</h2>
      </div>
      <div className="chat-messages">
        {chat.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.senderId}:</strong> {msg.message}
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