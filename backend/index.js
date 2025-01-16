const { createServer } = require("http");
const app = require("./app");
const { Server } = require("socket.io");
require("dotenv").config(); // 환경 변수 로드

// HTTP 서버 생성
const httpServer = createServer(app);

// WebSocket 서버 초기화
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // React 클라이언트 주소
        methods: ["GET", "POST"], // 허용할 HTTP 메서드
        credentials: true // 인증 정보 포함 여부
    }
});

// WebSocket 이벤트 핸들링
require("./utils/io")(io);

// 서버 실행
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8080; // 포트를 8080으로 변경
httpServer.listen(WEBSOCKET_PORT, () => {
    console.log(`WebSocket server is running on http://localhost:${WEBSOCKET_PORT}`);
});