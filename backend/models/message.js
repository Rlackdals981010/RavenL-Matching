const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'message', // 테이블 이름 지정
    timestamps: true, // createdAt, updatedAt 활성화
});

module.exports = Message;