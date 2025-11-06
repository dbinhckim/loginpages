// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Tạo kết nối Sequelize sử dụng biến môi trường
// Support both DB_DATABASE and DB_NAME env var names (docker-compose uses DB_NAME)
const databaseName = process.env.DB_DATABASE || process.env.DB_NAME;

const sequelize = new Sequelize(
  databaseName,   // tên database
  process.env.DB_USER,       // username MySQL
  process.env.DB_PASSWORD,   // password MySQL
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+07:00', // Giờ Việt Nam
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
