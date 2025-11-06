const bcrypt = require('bcryptjs');
const { User, Role, Permission, SystemLog } = require('../models');
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

/**
 * User management controller
 */
const userController = {
  /**
   * Get all users
   */
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Role }]
      });
      
      return res.status(200).json({
        success: true,
        data: users
      });
      
    } catch (error) {
      logger.error(`Get all users error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy danh sách người dùng' });
    }
  },
  
  /**
   * Get user by ID
   */
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Role, include: [Permission] }]
      });
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      
      return res.status(200).json({
        success: true,
        data: user
      });
      
    } catch (error) {
      logger.error(`Get user by ID error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' });
    }
  },
  
  /**
   * Create new user
   */
  createUser: async (req, res) => {
    try {
      const { username, email, password, full_name, role_id, is_active } = req.body;
      
      // Check if username or email already exists
      const existingUser = await User.findOne({
        where: { 
          [sequelize.Op.or]: [{ username }, { email }] 
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập hoặc email đã tồn tại'
        });
      }
      
      // Check if role exists
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Vai trò không tồn tại'
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const newUser = await User.create({
        username,
        email,
        password_hash: hashedPassword,
        full_name,
        role_id,
        is_active: is_active !== undefined ? is_active : true
      });
      
      // Log user creation
      await SystemLog.create({
        user_id: req.user.user_id,
        action: 'CREATE_USER',
        description: `Created user: ${username}`,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });
      
      return res.status(201).json({
        success: true,
        message: 'Tạo người dùng mới thành công',
        data: {
          user_id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          full_name: newUser.full_name,
          role_id: newUser.role_id,
          is_active: newUser.is_active
        }
      });
      
    } catch (error) {
      logger.error(`Create user error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tạo người dùng mới' });
    }
  },
  
  /**
   * Update user
   */
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { email, full_name, role_id, is_active, password } = req.body;
      
      // Find user
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      
      // Check if trying to update email and it already exists
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email đã tồn tại'
          });
        }
      }
      
      // Check if role exists
      if (role_id) {
        const role = await Role.findByPk(role_id);
        if (!role) {
          return res.status(400).json({
            success: false,
            message: 'Vai trò không tồn tại'
          });
        }
      }
      
      // Update user fields
      if (email) user.email = email;
      if (full_name) user.full_name = full_name;
      if (role_id) user.role_id = role_id;
      if (is_active !== undefined) user.is_active = is_active;
      
      // Update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(password, salt);
      }
      
      user.updated_at = new Date();
      await user.save();
      
      // Log user update
      await SystemLog.create({
        user_id: req.user.user_id,
        action: 'UPDATE_USER',
        description: `Updated user: ${user.username}`,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });
      
      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin người dùng thành công',
        data: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
          is_active: user.is_active
        }
      });
      
    } catch (error) {
      logger.error(`Update user error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi cập nhật người dùng' });
    }
  },
  
  /**
   * Delete user
   */
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Find user
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      
      // Cannot delete yourself
      if (req.user.user_id === parseInt(userId)) {
        return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình' });
      }
      
      // Log user deletion
      await SystemLog.create({
        user_id: req.user.user_id,
        action: 'DELETE_USER',
        description: `Deleted user: ${user.username}`,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });
      
      // Delete user
      await user.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công'
      });
      
    } catch (error) {
      logger.error(`Delete user error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi xóa người dùng' });
    }
  },
  
  /**
   * Get all roles
   */
  getAllRoles: async (req, res) => {
    try {
      const roles = await Role.findAll();
      
      return res.status(200).json({
        success: true,
        data: roles
      });
      
    } catch (error) {
      logger.error(`Get all roles error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy danh sách vai trò' });
    }
  }
};

module.exports = userController;
