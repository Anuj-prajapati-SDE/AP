const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Routes that don't require authentication
router.get('/recent-exams', publicController.getRecentExams);
router.get('/top-performers', publicController.getTopPerformers);
router.get('/platform-stats', publicController.getPlatformStats);

module.exports = router;