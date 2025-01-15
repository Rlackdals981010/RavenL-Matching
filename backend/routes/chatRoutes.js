const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware'); // JWT 인증 미들웨어

// 1. 로그인한 사용자의 채팅방 리스트 조회
router.get('/rooms', authMiddleware, chatController.getUserChatRooms);

// 2. 특정 채팅방의 메시지 내역 조회
router.get('/rooms/:roomId/messages', authMiddleware, chatController.getChatMessages);

// 3. 새 채팅방 생성
router.post('/rooms', authMiddleware, chatController.createChatRoom);

module.exports = router;