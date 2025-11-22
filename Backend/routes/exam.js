const express = require('express');
const {
  createExam,
  updateExam,
  getAllExams,
  getExam,
  startExam,
  submitExam,
  logSecurityViolation,
  checkExamAccess,
  getExamResult,
  deleteExam,
} = require('../controllers/examController');

const router = express.Router();

router.post('/', createExam);
router.get('/', getAllExams);
router.get('/:id', getExam);
router.put('/:id', updateExam);
router.post('/:id/start', startExam);
router.post('/:id/submit', submitExam);
router.post('/:examId/violation', logSecurityViolation);
router.post('/:examId/check-access', checkExamAccess);
router.get('/:examId/result', getExamResult);
router.delete('/:id/delete', deleteExam); 


module.exports = router;