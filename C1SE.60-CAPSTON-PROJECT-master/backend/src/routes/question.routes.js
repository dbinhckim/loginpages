const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { createQuestionValidation } = require('../middlewares/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Question routes
router.get('/', authorize(['QUESTION_MANAGEMENT']), questionController.getAllQuestions);
router.get('/:id', authorize(['QUESTION_MANAGEMENT']), questionController.getQuestionById);
router.post('/', authorize(['QUESTION_MANAGEMENT']), createQuestionValidation, questionController.createQuestion);
router.put('/:id', authorize(['QUESTION_MANAGEMENT']), questionController.updateQuestion);
router.delete('/:id', authorize(['QUESTION_MANAGEMENT']), questionController.deleteQuestion);

// Category routes
router.get('/categories/all', authorize(['QUESTION_MANAGEMENT']), questionController.getAllCategories);
router.post('/categories', authorize(['QUESTION_MANAGEMENT']), questionController.createCategory);
router.put('/categories/:id', authorize(['QUESTION_MANAGEMENT']), questionController.updateCategory);
router.delete('/categories/:id', authorize(['QUESTION_MANAGEMENT']), questionController.deleteCategory);

module.exports = router;
