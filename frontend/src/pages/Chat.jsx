import React, { useState, useEffect } from "react";
import socket from "../server";

const Chat = () => {
  const [roomId, setRoomId] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    socket.on("receiveMessage", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
    };
  }, []);

  // 방 생성
  const createRoom = () => {
    socket.emit("createRoom", otherUserId, (response) => {
      if (response.success) {
        console.log(`Room created: ${response.roomId}`);
        setRoomId(response.roomId);
      } else {
        console.error("Failed to create room:", response.error);
      }
    });
  };

  // 방 입장
  const joinRoom = () => {
    if (!roomId) {
      console.error("Room ID is required to join a room.");
      return;
    }

    socket.emit("joinRoom", roomId, (response) => {
      if (response.success) {
        console.log(`Joined room: ${response.roomId}`);
        setChat(response.messages); // 이전 대화 기록 추가
      } else {
        console.error("Failed to join room:", response.error);
      }
    });
  };

  // 메시지 전송
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
      <h1>Chat</h1>

      {/* 방 생성 */}
      <div>
        <h2>Create Room</h2>
        <input
          type="text"
          placeholder="Enter other user ID"
          value={otherUserId}
          onChange={(e) => setOtherUserId(e.target.value)}
        />
        <button onClick={createRoom}>Create Room</button>
      </div>

      {/* 방 입장 */}
      <div>
        <h2>Join Room</h2>
        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>

      {/* 채팅 메시지 */}
      <div>
        <h2>Messages</h2>
        {chat.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderId}: </strong>
            {msg.message}
          </div>
        ))}
      </div>

      {/* 메시지 입력 */}
      <div>
        <input
          type="text"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;