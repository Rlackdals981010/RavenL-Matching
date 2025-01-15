module.exports = (socket, io) => {
    console.log(`User connected: ${socket.id}`);

    // 채팅방에 입장
    socket.on('joinRoom', ({ roomId, userId }) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
    });

    // 메시지 전송
    socket.on('sendMessage', ({ roomId, message, sender }) => {
        const chatMessage = {
            roomId,
            sender,
            message,
            timestamp: new Date()
        };

        // 방에 있는 모든 클라이언트에 메시지 브로드캐스트
        io.to(roomId).emit('receiveMessage', chatMessage);

        // 데이터베이스 저장 로직 추가 필요
    });

    // 연결 해제
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};