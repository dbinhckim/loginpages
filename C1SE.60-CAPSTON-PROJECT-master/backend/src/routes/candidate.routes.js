const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

// Create a new candidate
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('candidate_create'),
  validationMiddleware.validateCreateCandidate,
  candidateController.createCandidate
);

// Get all candidates with filtering options
router.get(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('candidate_view'),
  candidateController.getAllCandidates
);

// Get candidate by ID
router.get(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('candidate_view'),
  candidateController.getCandidateById
);

// Update candidate
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('candidate_edit'),
  validationMiddleware.validateUpdateCandidate,
  candidateController.updateCandidate
);

// Delete candidate
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('candidate_delete'),
  candidateController.deleteCandidate
);

// Upload candidate resume
router.post(
  '/:id/resume',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('candidate_edit'),
  upload.single('resume'),
  candidateController.uploadResume
);

// Set primary resume
router.put(
  '/:candidateId/resume/:resumeId/set-primary',
  authMiddleware.verifyToken,
  authMiddleware.hasPermission('candidate_edit'),
  candidateController.setPrimaryResume
);

module.exports = router;
