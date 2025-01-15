import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ChatRooms.css";

const ChatRooms = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatRooms = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setError("You must be signed in to view chat rooms.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/chat/rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setChatRooms(response.data);
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
        setError("Failed to fetch chat rooms. Please try again.");
      }
    };

    fetchChatRooms();
  }, []);

  if (error) {
    return <div className="chat-rooms-error">{error}</div>;
  }

  const handleRoomClick = (roomId) => {
    navigate(`/chat/rooms/${roomId}`);
  };

  return (
    <div className="chat-rooms-container">
      <h1 className="chat-rooms-title">Chat Rooms</h1>
      <div className="chat-rooms-list">
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <div
              key={room.id}
              className="chat-room-item"
              onClick={() => handleRoomClick(room.id)}
            >
              <p>
                <strong>Room:</strong> {room.creator} ↔ {room.invitee}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(room.updatedAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="chat-rooms-empty">No chat rooms available.</p>
        )}
      </div>
    </div>
  );
};

export default ChatRooms;