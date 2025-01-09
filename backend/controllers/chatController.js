const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');
const { Op } = require('sequelize');

exports.createChat = async (req, res) => {
    const { user2_id } = req.body;
    try {
        const { id: user1_id } = req.user;
        const chat = await Chat.create({ user1_id, user2_id });
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getChats = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const chats = await Chat.findAll({
            where: {
                [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
            },
        });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    const { chatId } = req.params; // 채팅 방 ID
    const { content } = req.body; // 메시지 내용
    const { id: userId } = req.user; // 로그인한 사용자 ID 

    try {
        // 채팅 방 확인
        const chat = await Chat.findOne({
            where: { id: chatId },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // 로그인한 사용자가 채팅 방에 속해 있는지 확인
        if (chat.user1_id !== userId && chat.user2_id !== userId) {
            return res.status(403).json({ error: 'You are not a participant in this chat' });
        }

        // 메시지 생성
        const message = await Message.create({
            chat_id: chatId,
            sender_id: userId,
            content,
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 특정 채팅 방의 메시지 가져오기
exports.getMessages = async (req, res) => {
    const { chatId } = req.params; // 채팅 방 ID
    const { id: userId } = req.user; // 로그인한 사용자 ID (미들웨어에서 제공)

    try {
        // 채팅 방 확인
        const chat = await Chat.findOne({
            where: { id: chatId },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // 로그인한 사용자가 채팅 방에 속해 있는지 확인
        if (chat.user1_id !== userId && chat.user2_id !== userId) {
            return res.status(403).json({ error: 'You are not a participant in this chat' });
        }

        // 메시지 조회
        const messages = await Message.findAll({
            where: { chat_id: chatId },
            order: [['createdAt', 'ASC']],
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};