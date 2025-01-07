const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // 데이터베이스 설정 파일 경로

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    applicantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // `users` 테이블과 연결
            key: 'id',
        },
        onDelete: 'CASCADE', // 사용자 삭제 시 연쇄 삭제
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // `users` 테이블과 연결
            key: 'id',
        },
        onDelete: 'CASCADE', // 사용자 삭제 시 연쇄 삭제
    },
    transactionDate: {
        type: DataTypes.DATE, // 거래 날짜
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    process: {
        type: DataTypes.ENUM('Submitted', 'Accepted'),
        allowNull: false,
    },
    buyerFlag: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    sellerFlag: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'contact', // 테이블 이름 명시
    timestamps: true, // createdAt, updatedAt 자동 생성
});

module.exports = Contact;