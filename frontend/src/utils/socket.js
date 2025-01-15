import { io } from "socket.io-client";

// 환경 변수에서 WebSocket URL 가져오기
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_BASE_URL || "http://localhost:3000";

// WebSocket 초기화
const socket = io(WEBSOCKET_URL, {
  auth: {
    token: localStorage.getItem("jwtToken"), // WebSocket 연결 시 JWT 토큰 전달
  },
});

export default socket;