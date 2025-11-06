const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

// Health check endpoint for reports
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Reports API is running' });
});

// Placeholder for future report endpoints
router.get(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('report_view'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: []
    });
  }
);

module.exports = router;
