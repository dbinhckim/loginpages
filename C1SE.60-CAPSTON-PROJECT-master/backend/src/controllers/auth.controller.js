const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// ----- THAY ĐỔI -----: Đảm bảo require đúng User và Role từ models/index.js
const { User, Role, SystemLog, sequelize } = require('../models'); // Giả sử models/index.js export sequelize
// const { Sequelize } = require('sequelize'); // Có thể không cần nếu import từ models
const { Op } = require('sequelize'); // Import Op để dùng toán tử OR
const logger = require('../utils/logger');

// ----- MỚI: Thêm 2 dòng này để hỗ trợ Quên mật khẩu -----
const crypto = require('crypto');
const { sendEmail } = require('../utils/email.service'); // Đảm bảo bạn đã tạo file này
// -----------------------------------------------------

/**
 * User authentication controller
 */
const authController = {
  /**
   * Login with username/email and password
   */
  login: async (req, res) => {
    try {
      // ----- THAY ĐỔI -----: Nhận 'credential' thay vì 'username'
      const { credential, password } = req.body;

      // ----- THAY ĐỔI -----: Tìm user bằng username HOẶC email
      const user = await User.findOne({
        where: {
          [Op.or]: [ // Sử dụng toán tử OR
            { username: credential },
            { email: credential }
          ]
        },
        include: [{ model: Role, attributes: ['role_name'] }] // Lấy tên role
      });

      if (!user) {
        // Giữ thông báo chung chung để bảo mật
        return res.status(401).json({ success: false, message: 'Tên đăng nhập, email hoặc mật khẩu không chính xác' });
      }

      // Check if account is active
      if (!user.is_active) { // Giả sử model có trường is_active
        return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash); // Giả sử model có trường password_hash
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Tên đăng nhập, email hoặc mật khẩu không chính xác' });
      }

      // ----- THAY ĐỔI -----: Lấy role name từ include, đảm bảo JWT_SECRET được định nghĩa
      const userRoleName = user.Role ? user.Role.role_name : null; // Lấy role_name từ object Role
      const secret = process.env.JWT_SECRET;
      const expiresIn = process.env.JWT_EXPIRES_IN || '1h'; // Thêm giá trị mặc định

      if (!secret) {
        logger.error('JWT_SECRET is not defined in environment variables.');
        return res.status(500).json({ success: false, message: 'Lỗi cấu hình server.' });
      }


      // Create JWT token
      const token = jwt.sign(
        // ----- THAY ĐỔI -----: Payload nên chứa các thông tin cần thiết và an toàn
        { id: user.user_id, username: user.username, role: userRoleName }, // Giả sử model có user_id
        secret,
        { expiresIn: expiresIn }
      );

      // Update last login time (Nếu có trường last_login)
      // user.last_login = new Date();
      // await user.save();

      // Log login action (Nếu có model SystemLog)
      try {
        await SystemLog.create({
          user_id: user.user_id, // Giả sử model có user_id
          action: 'LOGIN',
          description: `User ${user.username} logged in`, // Thêm username vào log
          ip_address: req.ip,
          user_agent: req.get('user-agent') || 'N/A' // Thêm fallback
        });
      } catch (logError) {
        logger.error(`Failed to create system log during login: ${logError.message}`);
        // Không nên chặn login chỉ vì log lỗi, nhưng cần ghi nhận lại
      }


      // ----- THAY ĐỔI -----: Trả về cấu trúc JSON mà Frontend login.html mong đợi
      return res.status(200).json({
        success: true,
        // message: 'Đăng nhập thành công', // Có thể bỏ message nếu không cần
        role: userRoleName, // Trả về role trực tiếp để JS dễ xử lý redirect
        token: token, // Trả về token để lưu trữ ở client
        user: { // Trả về thông tin user nếu cần hiển thị ngay
          id: user.user_id,
          username: user.username,
          email: user.email,
          fullName: user.full_name // Giả sử model có full_name
        }
      });

    } catch (error) {
      logger.error(`Login error: ${error.message} - Stack: ${error.stack}`); // Log cả stack trace
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ khi đăng nhập' });
    }
  },

  /**
   * Register a new user account (applicant or recruiter)
   */
  register: async (req, res) => {
    // ----- THAY ĐỔI -----: Nhận thêm fullName và role từ body
    const { username, email, password, fullName, role } = req.body; // Đổi full_name thành fullName cho nhất quán

    // ----- THAY ĐỔI -----: Kiểm tra input ngay từ đầu
    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }
    // Có thể thêm kiểm tra độ dài password ở đây hoặc dùng validation middleware tốt hơn
    if (password.length < 8) { // Ví dụ kiểm tra độ dài tối thiểu
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
    }


    try {
      // Check if username or email already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        let message = '';
        if (existingUser.username === username) {
          message = 'Tên đăng nhập đã tồn tại.';
        } else {
          message = 'Email đã tồn tại.';
        }
        return res.status(400).json({
          success: false,
          message: message
        });
      }

      // ----- THAY ĐỔI -----: Tìm role dựa trên input từ Frontend
      const userRoleNameInput = role.toUpperCase(); // Chuyển thành chữ hoa để khớp (ví dụ: 'APPLICANT' hoặc 'RECRUITER')
      if (userRoleNameInput !== 'APPLICANT' && userRoleNameInput !== 'RECRUITER') {
        return res.status(400).json({ success: false, message: 'Loại tài khoản không hợp lệ.' });
      }

      const targetRole = await Role.findOne({
        where: { role_name: userRoleNameInput } // Tìm role_name khớp
      });

      if (!targetRole) {
        logger.error(`Role not found in database: ${userRoleNameInput}`); // Log lỗi cụ thể
        return res.status(500).json({
          success: false,
          message: 'Lỗi hệ thống: Không tìm thấy vai trò người dùng.' // Thông báo chung chung cho client
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password_hash: hashedPassword, // Giả sử model dùng password_hash
        full_name: fullName, // ----- THAY ĐỔI -----: Map fullName vào full_name
        role_id: targetRole.role_id, // ----- THAY ĐỔI -----: Dùng role_id tìm được
        is_active: true // Mặc định kích hoạt tài khoản
      });

      // Log registration (Nếu có model SystemLog)
      try {
        await SystemLog.create({
          user_id: newUser.user_id, // Giả sử model có user_id
          action: 'REGISTER',
          description: `New user registered: ${newUser.username} with role ${userRoleNameInput}`, // Log chi tiết hơn
          ip_address: req.ip,
          user_agent: req.get('user-agent') || 'N/A'
        });
      } catch (logError) {
        logger.error(`Failed to create system log during registration: ${logError.message}`);
        // Không nên chặn register chỉ vì log lỗi
      }


      // ----- THAY ĐỔI -----: Trả về cấu trúc JSON đơn giản mà Frontend register.html mong đợi
      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        // Có thể trả về thêm thông tin user nếu cần thiết, nhưng message là đủ
        // user: {
        //   id: newUser.user_id,
        //   username: newUser.username,
        //   email: newUser.email,
        //   fullName: newUser.full_name,
        //   role: userRoleNameInput
        // }
      });

    } catch (error) {
      logger.error(`Registration error: ${error.message} - Stack: ${error.stack}`);
      // Kiểm tra lỗi cụ thể từ Sequelize (ví dụ: validation error)
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ khi đăng ký' });
    }
  },

  // ==========================================================
  // HÀM CŨ ĐÃ ĐƯỢC THAY THẾ
  // ==========================================================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
  
      // 1. Tìm user bằng email
      const user = await User.findOne({ where: { email: email } });
      
      // 2. Nếu không tìm thấy, vẫn trả về thành công (để bảo mật)
      if (!user) {
        return res.status(200).send({ 
          success: true, 
          message: "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một link khôi phục." 
        });
      }
  
      // 3. Tạo token ngẫu nhiên (đây là token gửi cho user)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // 4. Hash token này trước khi lưu vào DB (an toàn hơn)
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
      // 5. Đặt thời gian hết hạn (10 phút)
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
  
      // 6. Lưu token đã hash và thời gian hết hạn vào DB
      user.reset_password_token = hashedToken;
      user.reset_password_expires = expires;
      await user.save();
  
      // 7. Tạo link khôi phục (chứa token gốc, CHƯA hash)
      //    Frontend của bạn sẽ chạy ở port 5173
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  
      // 8. Tạo nội dung email
      const emailHtml = `
        <p>Bạn (hoặc ai đó) đã yêu cầu khôi phục mật khẩu.</p>
        <p>Vui lòng nhấp vào đường link dưới đây để đặt lại mật khẩu (link có hiệu lực trong 10 phút):</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email.</p>
      `;
  
      // 9. Gửi email (sử dụng service bạn đã tạo)
      await sendEmail(user.email, "Yêu cầu khôi phục mật khẩu", emailHtml);
  
      res.status(200).send({ 
          success: true, 
          message: "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một link khôi phục." 
      });
  
    } catch (error) {
      logger.error(`forgotPassword error: ${error.message} - Stack: ${error.stack}`); // Dùng logger của bạn
      res.status(500).send({ success: false, message: "Đã xảy ra lỗi server." });
    }
  },
  
  // ==========================================================
  // HÀM MỚI ĐƯỢC THÊM VÀO
  // ==========================================================
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params; // Lấy token từ URL (ví dụ: /reset-password/abc123...)
      const { newPassword } = req.body;
  
      // 1. Hash token nhận được từ URL để so sánh với DB
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
      // 2. Tìm user bằng token đã hash VÀ token chưa hết hạn
      const user = await User.findOne({
        where: {
          reset_password_token: hashedToken,
          reset_password_expires: { [Op.gt]: new Date() } // [Op.gt] nghĩa là "lớn hơn" (greater than)
        }
      });
  
      // 3. Nếu token không hợp lệ hoặc đã hết hạn
      if (!user) {
        return res.status(400).send({ 
          success: false, 
          message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại." 
        });
      }
  
      // 4. Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt); // Tên cột của bạn là password_hash
  
      // 5. Cập nhật mật khẩu mới và xóa token đi (quan trọng)
      user.password_hash = passwordHash;
      user.reset_password_token = null;
      user.reset_password_expires = null;
      await user.save();
  
      res.status(200).send({ success: true, message: "Cập nhật mật khẩu thành công!" });
  
    } catch (error) {
      logger.error(`resetPassword error: ${error.message} - Stack: ${error.stack}`); // Dùng logger của bạn
      res.status(500).send({ success: false, message: "Đã xảy ra lỗi server." });
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (req, res) => {
    try {
      // User is already loaded in authenticate middleware (req.user)
      const user = req.user; // Lấy user từ middleware authenticate

      if (!user) {
        // Trường hợp này không nên xảy ra nếu middleware chạy đúng
        return res.status(401).json({ success: false, message: 'Không tìm thấy thông tin người dùng.' });
      }

      // Lấy lại thông tin user mới nhất với Role (để đảm bảo role name đúng)
      const freshUser = await User.findByPk(user.user_id, { // Giả sử middleware trả về user_id
        include: [{ model: Role, attributes: ['role_name'] }]
      });

      if (!freshUser) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      }


      return res.status(200).json({
        success: true,
        user: { // Trả về trong object user cho nhất quán
          id: freshUser.user_id,
          username: freshUser.username,
          email: freshUser.email,
          fullName: freshUser.full_name,
          role: freshUser.Role?.role_name, // Lấy role name từ include
          // lastLogin: freshUser.last_login // Nếu có trường last_login
        }
      });

    } catch (error) {
      logger.error(`Get profile error: ${error.message} - Stack: ${error.stack}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' });
    }
  },

  /**
   * Change user password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.user_id; // Lấy user_id từ middleware authenticate

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc'
        });
      }

      if (newPassword.length < 8) { // Nên đồng bộ với yêu cầu khi đăng ký
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 8 ký tự'
        });
      }

      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(44).json({ success: false, message: 'Người dùng không tồn tại.' });
      }


      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Mật khẩu hiện tại không chính xác'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password_hash = hashedPassword;
      await user.save();

      // Log password change (Nếu có model SystemLog)
      try {
        await SystemLog.create({
          user_id: userId,
          action: 'CHANGE_PASSWORD',
          description: `User ${user.username} changed password`,
          ip_address: req.ip,
          user_agent: req.get('user-agent') || 'N/A'
        });
      } catch (logError) {
        logger.error(`Failed to create system log during password change: ${logError.message}`);
      }


      return res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });

    } catch (error) {
      logger.error(`Change password error: ${error.message} - Stack: ${error.stack}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi đổi mật khẩu' });
    }
  },

  /**
   * Logout user
   */
  logout: async (req, res) => {
    try {
      // Logic logout thực sự thường phức tạp hơn (ví dụ: blacklist token JWT)
      // Ở đây chỉ đơn giản là log lại hành động nếu có user trong request
      if (req.user && req.user.user_id) { // Kiểm tra kỹ hơn
        try {
          await SystemLog.create({
            user_id: req.user.user_id,
            action: 'LOGOUT',
            description: `User ${req.user.username || 'N/A'} logged out`,
            ip_address: req.ip,
            user_agent: req.get('user-agent') || 'N/A'
          });
        } catch (logError) {
          logger.error(`Failed to create system log during logout: ${logError.message}`);
        }
      }

      // Thông thường, logout ở client chỉ cần xóa token đi là đủ
      return res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công' // Client sẽ xóa token dựa trên response này
      });

    } catch (error) {
      logger.error(`Logout error: ${error.message} - Stack: ${error.stack}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi đăng xuất' });
    }
  }
};

module.exports = authController;