const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
  },
  job: {
    type: DataTypes.ENUM('buyer', 'seller','admin'),
    allowNull: false,
  },
  state: {
    type: DataTypes.ENUM('active', 'deactive'),
    allowNull: false,
  }
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
