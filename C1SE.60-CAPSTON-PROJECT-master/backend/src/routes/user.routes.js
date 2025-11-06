const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { createUserValidation, updateUserValidation } = require('../middlewares/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Get all users - requires USER_MANAGEMENT permission
router.get('/', authorize(['USER_MANAGEMENT']), userController.getAllUsers);

// Get user by ID - requires USER_MANAGEMENT permission
router.get('/:id', authorize(['USER_MANAGEMENT']), userController.getUserById);

// Create user - requires USER_MANAGEMENT permission
router.post('/', authorize(['USER_MANAGEMENT']), createUserValidation, userController.createUser);

// Update user - requires USER_MANAGEMENT permission
router.put('/:id', authorize(['USER_MANAGEMENT']), updateUserValidation, userController.updateUser);

// Delete user - requires USER_MANAGEMENT permission
router.delete('/:id', authorize(['USER_MANAGEMENT']), userController.deleteUser);

// Get all roles - requires USER_MANAGEMENT or ROLE_MANAGEMENT permission
router.get('/roles/all', authorize(['USER_MANAGEMENT', 'ROLE_MANAGEMENT']), userController.getAllRoles);

module.exports = router;
