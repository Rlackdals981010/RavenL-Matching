const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResignComment = sequelize.define('ResignComment', {
    comment: {
        type: DataTypes.TEXT, // 긴 이유를 저장할 수 있도록 TEXT 사용
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'resignComments',
    timestamps: true,
});

module.exports = ResignComment;