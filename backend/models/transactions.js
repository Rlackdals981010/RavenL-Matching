const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 데이터베이스 설정 파일 경로

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // `users` 테이블과 연결
            key: 'id',
        },
        onDelete: 'CASCADE', // 사용자 삭제 시 연쇄 삭제
    },
    rating: {
        type: DataTypes.FLOAT, // 평점 (1~5)
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    product: {
        type: DataTypes.STRING, // 거래된 상품명
        allowNull: true,
    },
    transactionDate: {
        type: DataTypes.DATE, // 거래 날짜
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'transactions', // 테이블 이름 명시
    timestamps: true, // createdAt, updatedAt 자동 생성
});

module.exports = Transaction;