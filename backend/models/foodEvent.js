const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FoodEvent = sequelize.define('FoodEvent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    brand_product: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category_1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category_2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    seller_address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'foodEvent', // 테이블 이름 지정
    timestamps: false, // createdAt, updatedAt 필드 비활성화
});

module.exports = FoodEvent;