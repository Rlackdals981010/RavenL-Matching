const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
  },
  job: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin'),
    allowNull: false,
  },
  state: {
    type: DataTypes.ENUM('active', 'deactive'),
    allowNull: false,
  },
  // 캐싱 필드
  rating: {
    type: DataTypes.FLOAT(2, 1), // 최대 소수점 한 자리
    defaultValue: 0, // 초기값
  },
  rating_count: {
    type: DataTypes.INTEGER, // 총 거래 수
    defaultValue: 0, // 초기값
  },
  transaction_count: {
    type: DataTypes.INTEGER, // 총 거래 수
    defaultValue: 0, // 초기값
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;