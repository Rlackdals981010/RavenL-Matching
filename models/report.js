const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetId: {
    type: DataTypes.INTEGER, // 신고 대상 ID
    allowNull: false,
  },
  reporterId: {
    type: DataTypes.INTEGER, // 신고자 ID
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'), // 신고 상태
    defaultValue: 'pending',
    allowNull: false,
  },
}, {
  tableName: 'reports',
  timestamps: true,
});

module.exports = Report;