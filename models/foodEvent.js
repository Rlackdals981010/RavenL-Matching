const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database'); // Sequelize 인스턴스 가져오기 (경로는 프로젝트에 맞게 수정)

const FoodEvent = sequelize.define('FoodEvent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: true, // NULL 허용 여부 (필요에 따라 true/false로 변경)
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