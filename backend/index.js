const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // JWT 인증 라이브러리
const app = require('./app'); // 기존 app.js 가져오기

// HTTP 서버 생성
const server = http.createServer(app);

// Socket.IO 초기화
const io = new Server(server, {
    cors: {
        origin: '*', // 필요한 경우 도메인 제한
        methods: ['GET', 'POST']
    }
});

// WebSocket JWT 인증 미들웨어 추가
io.use((socket, next) => {
    const token = socket.handshake.auth.token; // 클라이언트에서 보낸 JWT
    if (!token) {
        return next(new Error('Authentication error')); // 인증 실패
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET); // JWT 검증
        socket.user = user; // 인증된 사용자 정보를 소켓에 저장
        next(); // 인증 성공
    } catch (error) {
        next(new Error('Invalid token')); // JWT 검증 실패
    }
});

// 소켓 이벤트 핸들링 로직
const socketManager = require('./sockets/socketManager');
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user?.name || 'Unknown'}`); // 인증된 사용자 정보 확인
    socketManager(socket, io); // 기존 소켓 이벤트 핸들링
});

// 서버 실행
const PORT = process.env.WEBSOCKET_PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});