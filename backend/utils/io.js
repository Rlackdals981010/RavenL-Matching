const jwt = require("jsonwebtoken");
const Room = require("../models/chatRoom"); // 방 스키마
const Message = require("../models/chatMessage"); // 메시지 스키마

const createRoomId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("-");
};

module.exports = function (io) {
    // WebSocket 인증 미들웨어
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error"));

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = user; // JWT에서 유저 정보 저장
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.id}`);

        // 방 생성
        socket.on("createRoom", async (otherUserId, callback) => {
            try {
                const roomId = createRoomId(socket.user.id, otherUserId);

                // 방이 이미 존재하는지 확인
                const existingRoom = await Room.findOne({ roomId });
                if (existingRoom) {
                    console.log(`Room already exists: ${roomId}`);
                    callback({ success: true, roomId });
                    return;
                }

                // 새로운 방 생성
                const newRoom = new Room({
                    roomId,
                    participants: [socket.user.id, otherUserId],
                });
                await newRoom.save();

                socket.join(roomId); // 방에 참여
                console.log(`Room created: ${roomId}`);
                callback({ success: true, roomId });
            } catch (error) {
                console.error("Room creation error:", error);
                callback({ success: false, error: "Failed to create room" });
            }
        });

        // 방 입장
        socket.on("joinRoom", async (roomId, callback) => {
            try {
                // 방 정보 확인
                const room = await Room.findOne({ roomId });
                if (!room) {
                    callback({ success: false, error: "Room not found" });
                    return;
                }

                // 참여자가 이미 방에 있는지 확인
                if (!room.participants.includes(socket.user.id)) {
                    room.participants.push(socket.user.id);
                    await room.save();
                }

                socket.join(roomId);
                console.log(`User ${socket.user.id} joined room ${roomId}`);

                // 메시지 기록 조회
                const messages = await Message.find({ roomId }).sort({ timestamp: 1 });

                // 읽지 않은 메시지 개수 계산
                const unreadMessages = messages.filter(
                    (msg) => msg.senderId !== socket.user.id && !msg.read
                );
                console.log(
                    `Room ${roomId}: User ${socket.user.id} has ${unreadMessages.length} unread messages.`
                );

                // 읽지 않은 메시지 읽음 처리
                await Message.updateMany(
                    { roomId, senderId: { $ne: socket.user.id }, read: false },
                    { $set: { read: true } }
                );

                callback({ success: true, roomId, messages }); // 메시지 포함하여 클라이언트로 반환
            } catch (error) {
                console.error("Join room error:", error);
                callback({ success: false, error: "Failed to join room" });
            }
        });

        // 메시지 전송
        socket.on("sendMessage", async (data, callback = () => { }) => {
            const { roomId, message } = data;

            try {
                // 메시지 저장
                const newMessage = new Message({
                    roomId,
                    senderId: socket.user.id,
                    message,
                });
                await newMessage.save();

                // 메시지 전송
                io.to(roomId).emit("receiveMessage", {
                    roomId,
                    senderId: socket.user.id,
                    message,
                    timestamp: newMessage.createdAt,
                });

                // 콜백 성공 응답
                callback({ success: true });
            } catch (error) {
                console.error("Message sending error:", error);
                callback({ success: false, error: "Failed to send message" });
            }
        });

        // 연결 해제
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });
    });
};