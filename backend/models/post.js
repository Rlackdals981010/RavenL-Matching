const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
    type: {
        type: DataTypes.ENUM('notice'), // 타입 구분
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER, // 작성자 ID
        allowNull: false,
    },
}, {
    tableName: 'posts',
    timestamps: true,
});

module.exports = Post;
