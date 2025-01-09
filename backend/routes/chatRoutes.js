const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createChat,getChats, sendMessage,getMessages} = require('../controllers/chatController');

// 채팅 방 생성
router.post('/',authMiddleware, createChat);
// 채팅 방 목록 조회
router.get('/', authMiddleware,getChats);

// 메시지 전송
router.post('/:chatId/messages',authMiddleware, sendMessage);

// 메시지 목록 조회
router.get('/:chatId/messages', authMiddleware,getMessages);
module.exports = router;