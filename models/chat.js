const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'chat', // 테이블 이름 지정
    timestamps: true, // createdAt, updatedAt 활성화
});

module.exports = Chat;