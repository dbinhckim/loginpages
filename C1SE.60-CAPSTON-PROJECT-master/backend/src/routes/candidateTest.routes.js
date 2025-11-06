const express = require('express');
const router = express.Router();
const candidateTestController = require('../controllers/candidateTest.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');

// Routes for recruiters/admins
router.post(
  '/assign',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('test_assign'),
  validationMiddleware.validateAssignTest,
  candidateTestController.assignTest
);

router.get(
  '/admin',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('test_view'),
  candidateTestController.getAllCandidateTests
);

router.get(
  '/admin/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('test_view'),
  candidateTestController.getCandidateTestById
);

router.put(
  '/:id/review',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('test_review'),
  validationMiddleware.validateReviewTest,
  candidateTestController.reviewCandidateTest
);

// Routes for candidates (no auth required, uses access token)
router.get(
  '/access/:token',
  candidateTestController.getTestByToken
);

router.post(
  '/:id/start',
  validationMiddleware.validateStartTest,
  candidateTestController.startTest
);

router.post(
  '/:id/answer',
  validationMiddleware.validateSubmitAnswer,
  candidateTestController.submitAnswer
);

router.post(
  '/:id/complete',
  candidateTestController.completeTest
);

router.post(
  '/:id/fraud',
  validationMiddleware.validateFraudEvent,
  candidateTestController.logFraudEvent
);

module.exports = router;
