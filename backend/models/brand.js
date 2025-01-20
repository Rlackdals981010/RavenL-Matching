const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Brand = sequelize.define('Brand', {
    productName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brandProduct: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category3: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    thumb: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sellerAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    babyFood: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    certification: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    madeIn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'brands', // MySQL 테이블 이름
    timestamps: true, // createdAt 및 updatedAt 자동 관리
});

module.exports = Brand;