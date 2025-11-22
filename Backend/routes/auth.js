const express = require('express');
const { loginAdmin, loginStudent } = require('../controllers/authController');

const router = express.Router();

router.post('/login/admin', loginAdmin);
router.post('/login/student', loginStudent);

module.exports = router;