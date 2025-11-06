const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Test routes
router.get('/', authorize(['TEST_MANAGEMENT']), testController.getAllTests);
router.get('/:id', authorize(['TEST_MANAGEMENT']), testController.getTestById);
router.post('/', authorize(['TEST_MANAGEMENT']), testController.createTest);
router.put('/:id', authorize(['TEST_MANAGEMENT']), testController.updateTest);
router.delete('/:id', authorize(['TEST_MANAGEMENT']), testController.deleteTest);

// Test questions management
router.post('/:id/questions', authorize(['TEST_MANAGEMENT']), testController.addQuestionsToTest);
router.delete('/:testId/questions/:questionId', authorize(['TEST_MANAGEMENT']), testController.removeQuestionFromTest);

module.exports = router;
