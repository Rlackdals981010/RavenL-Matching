import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../server";

const Chat = () => {
  const { roomId } = useParams(); // URL에서 roomId 가져오기
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // 방 참여 요청
    socket.emit("joinRoom", roomId, (response) => {
      if (response.success) {
        console.log(`Joined room: ${roomId}`);
        setChat(response.messages); // 이전 메시지 로드
      } else {
        console.error("Failed to join room:", response.error);
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
    <div>
      <h1>Chat Room: {roomId}</h1>
      <div>
        {chat.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderId}: </strong>
            {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;