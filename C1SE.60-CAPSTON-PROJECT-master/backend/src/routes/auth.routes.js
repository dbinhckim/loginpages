const express = require('express');
const router = express.Router();

// Sửa lại đường dẫn require cho đúng
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// ----- THAY ĐỔI: Thêm 'resetPasswordValidation' -----
const validationMiddleware = require('../middlewares/validation.middleware') || {};
let { 
    loginValidation, 
    registerValidation, 
    emailValidation, 
    resetPasswordValidation // Thêm dòng này
} = validationMiddleware;

// Ensure each validation middleware is defined and is an array/function acceptable to Express
const ensureMiddleware = (mw, name) => {
    if (!mw) {
        // fallback middleware that returns an explicit 500 response so server doesn't crash at route registration
        console.warn(`[WARN] Validation middleware '${name}' is missing. Using fallback that returns 500 at runtime.`);
        return [(req, res) => res.status(500).json({ success: false, message: `Server misconfiguration: middleware ${name} is missing` })];
    }
    return mw;
};

loginValidation = ensureMiddleware(loginValidation, 'loginValidation');
registerValidation = ensureMiddleware(registerValidation, 'registerValidation');
emailValidation = ensureMiddleware(emailValidation, 'emailValidation');
// ----- THAY ĐỔI: Thêm dòng này -----
resetPasswordValidation = ensureMiddleware(resetPasswordValidation, 'resetPasswordValidation');

// Ensure controller handlers exist. If missing, provide a runtime fallback middleware
const ensureHandler = (handler, name) => {
    if (typeof handler !== 'function') {
        console.error(`[ERROR] Controller handler '${name}' is missing or not a function.`);
        return (req, res) => res.status(500).json({ success: false, message: `Server misconfiguration: controller handler ${name} is missing` });
    }
    return handler;
};

// Public routes (Không cần authenticate middleware)
router.post('/login', loginValidation, ensureHandler(authController && authController.login, 'authController.login')); // POST /api/auth/login
router.post('/register', registerValidation, ensureHandler(authController && authController.register, 'authController.register')); // POST /api/auth/register
router.post('/forgot-password', emailValidation, ensureHandler(authController && authController.forgotPassword, 'authController.forgotPassword')); // POST /api/auth/forgot-password

// ----- THAY ĐỔI: Thêm route mới cho Reset Password -----
// Route này nhận token từ URL param (ví dụ: /api/auth/reset-password/abc123xyz)
router.post(
    '/reset-password/:token', // :token khớp với req.params.token trong controller
    resetPasswordValidation,  // Kiểm tra newPassword trong body
    ensureHandler(authController && authController.resetPassword, 'authController.resetPassword')
);
// ----------------------------------------------------

// Protected routes (Cần authenticate middleware để kiểm tra token JWT)
// Các route này yêu cầu người dùng phải đăng nhập và gửi kèm token
router.get('/profile', authenticate, ensureHandler(authController && authController.getProfile, 'authController.getProfile')); // GET /api/auth/profile
router.post('/change-password', authenticate, ensureHandler(authController && authController.changePassword, 'authController.changePassword')); // POST /api/auth/change-password
router.post('/logout', authenticate, ensureHandler(authController && authController.logout, 'authController.logout')); // POST /api/auth/logout

module.exports = router;