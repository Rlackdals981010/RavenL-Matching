const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ChatRoom = require('./ChatRoom'); // ChatRoom 모델 가져오기

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ChatRoom, // ChatRoom 모델 참조
            key: 'id',       // ChatRoom의 기본 키
        },
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'chat_message',
    timestamps: true,
});

// 관계 설정: ChatMessage -> ChatRoom
ChatMessage.belongsTo(ChatRoom, {
    foreignKey: 'roomId',
});

module.exports = ChatMessage;