const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createStudent,
  getAllStudents,
  toggleBlockStudent,
  sendExamLink,
  getExamResults,
  importStudentsFromExcel,
} = require('../controllers/adminController');

// Configure multer storage for Excel files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `students-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to allow only Excel files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.xlsx', '.xls', '.csv'];
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(extname)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  }
});

const router = express.Router();

router.post('/students', createStudent);
router.get('/students', getAllStudents);
router.patch('/students/:id/toggle-block', toggleBlockStudent);
router.post('/send-exam-link', sendExamLink);
router.get('/exams/:examId/results', getExamResults);
router.post('/import-students', upload.single('file'), importStudentsFromExcel);

module.exports = router;