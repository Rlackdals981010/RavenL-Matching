const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TempUser = sequelize.define('TempUser', {
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
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin'),
    allowNull: false,
  },
}, {
  tableName: 'tempUsers',
  timestamps: true,
});


module.exports = TempUser;