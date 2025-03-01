const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Sequelize 초기화 파일

const Subscription = sequelize.define('Subscription', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    plan: {
        type: DataTypes.ENUM('free', 'premium'),
        defaultValue: 'free',
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'CANCELED'),
        defaultValue: 'ACTIVE',
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    endDate: {
        type: DataTypes.DATE,
    },
    paymentId: {
        type: DataTypes.STRING,
    },
    payerId: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'subscription',
    timestamps: true,
});


module.exports = Subscription;