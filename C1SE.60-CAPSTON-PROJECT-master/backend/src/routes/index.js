const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const questionRoutes = require('./question.routes');
const testRoutes = require('./test.routes');
const candidateRoutes = require('./candidate.routes');
const jobRoutes = require('./job.routes');
const interviewRoutes = require('./interview.routes');
const candidateTestRoutes = require('./candidateTest.routes');
const reportRoutes = require('./report.routes');

// Use route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/questions', questionRoutes);
router.use('/tests', testRoutes);
router.use('/candidates', candidateRoutes);
router.use('/jobs', jobRoutes);
router.use('/interviews', interviewRoutes);
router.use('/candidate-tests', candidateTestRoutes);
router.use('/reports', reportRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

module.exports = router;
