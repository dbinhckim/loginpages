const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Đảm bảo đường dẫn này đúng
const Role = require('./role.model.js'); // Sửa thành tên file đúng // MỚI: Import Role để định nghĩa quan hệ

// Định nghĩa model User
const User = sequelize.define(
  'User',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true, // Cho phép null nếu không bắt buộc
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Có thể false nếu mọi user phải có role
      references: {
        model: 'roles', // Tên bảng roles trong database
        key: 'role_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Hoặc 'RESTRICT' nếu không muốn xóa user khi role bị xóa
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // ----- MỚI: Cột cho chức năng Quên Mật Khẩu -----
    reset_password_token: {
        type: DataTypes.STRING(255), // Lưu token đã hash
        allowNull: true,             // Chỉ có giá trị khi yêu cầu reset
        defaultValue: null
    },
    reset_password_expires: {
        type: DataTypes.DATE,        // Lưu thời gian hết hạn
        allowNull: true,
        defaultValue: null
    },
    // -------------------------------------------------
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'users',
    timestamps: true, // ĐỔI: Nên để true để Sequelize tự quản lý created_at, updated_at
    createdAt: 'created_at', // Map createdAt của Sequelize với cột created_at
    updatedAt: 'updated_at', // Map updatedAt của Sequelize với cột updated_at
    underscored: true, // Giúp Sequelize tự hiểu tên cột có gạch dưới
  }
);

// ----- MỚI: Định nghĩa quan hệ User thuộc về Role -----
// Giả định bạn đã import Role ở trên
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' }); // Quan hệ ngược lại (tùy chọn)
// ---------------------------------------------------

module.exports = User;
