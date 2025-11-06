const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');

// Job Positions

// Create a new job position
router.post(
  '/positions',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_position_create'),
  validationMiddleware.validateCreateJobPosition,
  jobController.createJobPosition
);

// Get all job positions
router.get(
  '/positions',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_position_view'),
  jobController.getAllJobPositions
);

// Get job position by ID
router.get(
  '/positions/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_position_view'),
  jobController.getJobPositionById
);

// Update job position
router.put(
  '/positions/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_position_edit'),
  validationMiddleware.validateUpdateJobPosition,
  jobController.updateJobPosition
);

// Delete job position
router.delete(
  '/positions/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_position_delete'),
  jobController.deleteJobPosition
);

// Job Applications

// Create a job application
router.post(
  '/applications',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_application_create'),
  validationMiddleware.validateCreateJobApplication,
  jobController.createJobApplication
);

// Get job applications with filtering
router.get(
  '/applications',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_application_view'),
  jobController.getJobApplications
);

// Update job application status
router.put(
  '/applications/:id/status',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('job_application_edit'),
  validationMiddleware.validateUpdateApplicationStatus,
  jobController.updateApplicationStatus
);

module.exports = router;
