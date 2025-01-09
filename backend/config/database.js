const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,                    // 데이터베이스 이름
  process.env.DB_USER,                    // 사용자
  process.env.DB_PASSWORD,                // 비밀번호
  {
    host: process.env.DB_HOST,            // 호스트
    port: process.env.DB_PORT || 3306,    // 포트 (3307로 설정)
    dialect: 'mysql',
    logging: false,                       // SQL 로그 비활성화
  }
);

module.exports = { sequelize };
