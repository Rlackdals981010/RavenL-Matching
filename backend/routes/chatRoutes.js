const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Room = require("../models/chatRoom");
const Message = require("../models/chatMessage");
const User = require("../models/user");

const moment = require("moment"); // 날짜/시간 처리를 위해 moment.js 사용 (설치 필요)

router.get("/rooms", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // 현재 사용자가 속한 방 조회
        const rooms = await Room.find({ participants: user.id });

        const enrichedRooms = await Promise.all(
            rooms.map(async (room) => {
                // 현재 사용자 제외한 상대방 ID 찾기
                const otherUserId = room.participants.find(
                    (participantId) => String(participantId) !== String(user.id)
                );

                // 상대방 사용자 정보 가져오기
                const otherUser = await User.findByPk(otherUserId);

                // 마지막 메시지 가져오기
                const messages = await Message.find({ roomId: room.roomId }).sort({ timestamp: -1 });
                const lastMessage = messages[0];

                // 읽지 않은 메시지 개수 계산
                const unreadMessages = messages.filter(
                    (msg) => msg.senderId !== user.id && !msg.read
                );

                // 날짜 포맷팅: 오늘이면 시간만, 아니면 날짜만
                let formattedTime = null;
                if (lastMessage?.timestamp) {
                    const messageDate = moment(lastMessage.timestamp);
                    const currentDate = moment();

                    if (messageDate.isSame(currentDate, "day")) {
                        formattedTime = messageDate.format("A hh:mm"); // AM/PM hh:mm 포맷
                    } else {
                        formattedTime = messageDate.format("YYYY-MM-DD"); // 날짜만
                    }
                }

                return {
                    roomId: room.roomId,
                    otherUserName: otherUser?.name || "Unknown", // 상대방 이름 표시
                    lastMessage: lastMessage?.message || "No messages yet",
                    lastMessageTime: formattedTime, // 포맷된 시간 또는 날짜
                    unreadCount: unreadMessages.length,
                };
            })
        );

        res.json(enrichedRooms);
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "Invalid token" });
    }
});

router.put("/rooms/:roomId/read", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const { roomId } = req.params;

        // 해당 방의 읽지 않은 메시지 읽음 처리
        await Message.updateMany(
            { roomId, senderId: { $ne: user.id }, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
});

module.exports = router;