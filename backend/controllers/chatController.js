const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const { Op } = require('sequelize'); // Sequelize Operators

// 1. 사용자 채팅방 리스트 조회
exports.getUserChatRooms = async (req, res) => {
    try {
        const userId = req.user.id; // 인증된 사용자 ID
        console.log("Fetching chat rooms for user:", userId);

        // 채팅방만 조회
        const rooms = await ChatRoom.findAll({
            where: {
                [Op.or]: [{ creatorId: userId }, { invitedUserId: userId }]
            },
            order: [['createdAt', 'DESC']] // 최신 생성된 채팅방 순서로 정렬
        });

        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching chat rooms:", error);
        res.status(500).json({ message: 'Failed to fetch chat rooms.' });
    }
};

// 2. 특정 채팅방의 메시지 내역 조회
exports.getChatMessages = async (req, res) => {
    try {
        const { roomId } = req.params;

        // 특정 채팅방의 메시지 조회
        const messages = await ChatMessage.findAll({
            where: { roomId },
            order: [['createdAt', 'ASC']] // 오래된 메시지부터 정렬
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ message: 'Failed to fetch chat messages.' });
    }
};

// 3. 새 채팅방 생성
exports.createChatRoom = async (req, res) => {
    try {
        const { invitedUserId } = req.body;
        const userId = req.user.id;

        // 이미 존재하는 채팅방 검사
        const existingRoom = await ChatRoom.findOne({
            where: {
                [Op.or]: [
                    { creatorId: userId, invitedUserId },
                    { creatorId: invitedUserId, invitedUserId: userId }
                ]
            }
        });

        if (existingRoom) {
            return res.status(400).json({ message: 'Chat room already exists.' });
        }

        // 새로운 채팅방 생성
        const newRoom = await ChatRoom.create({ creatorId: userId, invitedUserId });
        res.status(201).json(newRoom);
    } catch (error) {
        console.error('Error creating chat room:', error);
        res.status(500).json({ message: 'Failed to create chat room.' });
    }
};