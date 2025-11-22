const express = require('express');
const { getAvailableExams, checkExam } = require('../controllers/studentController');

const router = express.Router();

router.get('/exams', getAvailableExams);
router.post('/check-exam',  checkExam);

module.exports = router;