const express = require('express');
const {
  createExam,
  getAllExams,
  getExam,
  startExam,
  submitExam,
  logSecurityViolation,
  checkExamAccess,
  getExamResult,
  generateExam,
  deleteExam,
} = require('../controllers/examController');

const router = express.Router();

router.post('/', createExam);
router.get('/', getAllExams);
router.get('/:id', getExam);
router.post('/:id/start', startExam);
router.post('/:id/submit', submitExam);
router.post('/:examId/violation', logSecurityViolation);
router.post('/:examId/check-access', checkExamAccess);
router.get('/:examId/result', getExamResult);
router.post('/generate', generateExam);
router.delete('/:id/delete', deleteExam); 


module.exports = router;