const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');

// Schedule a new interview
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_schedule'),
  validationMiddleware.validateScheduleInterview,
  interviewController.scheduleInterview
);

// Get all interviews
router.get(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_view'),
  interviewController.getAllInterviews
);

// Get interview by ID
router.get(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_view'),
  interviewController.getInterviewById
);

// Update interview
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_edit'),
  validationMiddleware.validateUpdateInterview,
  interviewController.updateInterview
);

// Add interview participants
router.post(
  '/:id/participants',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_edit'),
  validationMiddleware.validateAddParticipants,
  interviewController.addInterviewParticipants
);

// Remove interview participant
router.delete(
  '/:interviewId/participants/:userId',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_edit'),
  interviewController.removeInterviewParticipant
);

// Submit interview feedback
router.post(
  '/:id/feedback',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_feedback'),
  validationMiddleware.validateInterviewFeedback,
  interviewController.submitFeedback
);

// Get all feedback for an interview
router.get(
  '/:id/feedback',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('interview_view'),
  interviewController.getInterviewFeedback
);

module.exports = router;
