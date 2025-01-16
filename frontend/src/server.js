import { io } from "socket.io-client";

// WebSocket 서버 URL
const token = localStorage.getItem("token"); // 로그인 시 저장된 JWT 토큰
const socket = io("http://localhost:8080", {
  auth: { token },
});

export default socket;