const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const ChatRoom = sequelize.define('ChatRoom', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    invitedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'chat_room',
    timestamps: true,
});

module.exports = ChatRoom;