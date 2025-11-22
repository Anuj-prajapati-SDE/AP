const Admin = require('../models/Admin');
const Student = require('../models/Student');

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide email and password' });
    }

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const isPasswordCorrect = await admin.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = admin.createJWT();
        res.status(200).json({
            user: {
                name: admin.name,
                email: admin.email,
                role: 'admin',
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ msg: 'Something went wrong, try again later' });
    }
};

// Update the loginStudent function

const loginStudent = async (req, res) => {
    const { studentId, password } = req.body;

    console.log('Login attempt for student:', studentId); // Debug log

    if (!studentId || !password) {
        return res.status(400).json({ msg: 'Please provide student ID and password' });
    }

    try {
        const student = await Student.findOne({ studentId });

        if (!student) {
            console.log('Student not found with ID:', studentId); // Debug log
            return res.status(401).json({ msg: 'Invalid credentials Student Id' });
        }

        if (student.isBlocked) {
            console.log('Student account is blocked:', studentId); // Debug log
            return res.status(401).json({ msg: 'Your account is blocked. Please contact admin.' });
        }

        // First check if there's a valid temporary password
        let isPasswordValid = false;
        let usedTemporaryPassword = false;

        // Check temporary password if it exists and hasn't expired
        if (student.tempExamPassword &&
            student.tempPasswordExpiry &&
            new Date(student.tempPasswordExpiry) > new Date() &&
            password === student.tempExamPassword) {  // Compare plaintext temp password

            isPasswordValid = true;
            usedTemporaryPassword = true;
            console.log('Student logged in with temporary password:', studentId); // Debug log
        } else {
            // If no valid temp password, check regular password
            isPasswordValid = await student.comparePassword(password);
        }

        if (!isPasswordValid) {
            console.log('Incorrect password for student:', studentId); // Debug log
            return res.status(401).json({ msg: 'Invalid credentials Password' });
        }

        const token = student.createJWT();

        // Optional: You might want to include a flag indicating if they used a temp password
        // This could be useful if you want to force them to change password or limit access
        console.log('Student login successful:', studentId); // Debug log

        res.status(200).json({
            user: {
                name: student.name,
                studentId: student.studentId,
                email: student.email,
                role: 'student',
                usingTempPassword: usedTemporaryPassword  // Optional flag
            },
            token,
        });
    } catch (error) {
        console.error('Error during student login:', error); // Debug log
        res.status(500).json({ msg: 'Something went wrong, try again later' });
    }
};

module.exports = {
    loginAdmin,
    loginStudent,
};