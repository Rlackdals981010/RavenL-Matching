const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Verification = sequelize.define('Verification', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Verification;