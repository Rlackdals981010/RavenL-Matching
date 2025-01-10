const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'canceled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    payerId: {
        type: DataTypes.STRING,
        allowNull: true, // 결제 승인 후 저장
    },
},{
    tableName: 'payment', // 테이블 이름 명시
    timestamps: true, // createdAt, updatedAt 자동 생성
});

module.exports = Payment;