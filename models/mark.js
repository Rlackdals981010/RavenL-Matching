const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mark = sequelize.define('Mark', {
    // 등록한 사람
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // 대상
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type:{
        type: DataTypes.ENUM('buyer', 'seller'), // 타입 구분
        allowNull: false,
    }
}, {
    tableName: 'marks',
    timestamps: true,
});

module.exports = Mark;