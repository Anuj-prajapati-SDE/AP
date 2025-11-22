const Student = require("../models/Student");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const nodemailer = require("nodemailer");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const JUVLON_BASE_URL = "https://api2.juvlon.com/v5";

// Axios instance
const juvlon = axios.create({
  baseURL: JUVLON_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const API_KEY = process.env.JUVLON_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME = process.env.FROM_NAME;
const LIST_NAME = process.env.LIST_NAME;

// Send single email
async function sendSingleEmail(to, subject, html) {
  try {
    const payload = {
      apiKey: API_KEY,
      from: FROM_EMAIL,
      to,
      subject,
      body: encodeURIComponent(html),
      trackClicks: 1,
      sendWithoutAttachment: 1,
    };

    if (FROM_NAME) payload.fromName = FROM_NAME;
    if (LIST_NAME) payload.listName = LIST_NAME;

    const res = await juvlon.post("/sendEmail", payload);
    console.log(`✔ Success ${to}:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`✖ Failed ${to}:`, err.response?.data || err.message);
  }
}

// Bulk email sender
const sendBulkEmails = async function (recipients, subject, html) {
  console.log(`📩 Starting bulk send: ${recipients.length} emails...`);

  for (const email of recipients) {
    await sendSingleEmail(email, subject, html);

    // Delay 300ms between each request (adjust if needed)
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log("🏁 Bulk sending finished!");
};

// -------------------------------------------------------------------------------------------------------------------------

// Create student account
const createStudent = async (req, res) => {
  const { name, email, studentId, password } = req.body;

  try {
    // Check if admin user
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to create students" });
    }

    const student = await Student.create({
      name,
      email,
      studentId,
      password,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        createdAt: student.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ msg: "Student ID or email already exists" });
    }
    res.status(500).json({ msg: "Something went wrong, try again later" });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    // Check if admin user
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to view students" });
    }

    const students = await Student.find({ createdBy: req.user.userId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ students, count: students.length });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong, try again later" });
  }
};

// Block/unblock student
const toggleBlockStudent = async (req, res) => {
  const { id: studentId } = req.params;

  try {
    // Check if admin user
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to modify students" });
    }

    const student = await Student.findOne({
      _id: studentId,
      createdBy: req.user.userId,
    });

    if (!student) {
      return res
        .status(404)
        .json({ msg: `No student found with id ${studentId}` });
    }

    student.isBlocked = !student.isBlocked;
    await student.save();

    res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        isBlocked: student.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong, try again later" });
  }
};

// Send exam link to students
// Update the sendExamLink function in adminController.js

const sendExamLink = async (req, res) => {
  const { examId, studentIds } = req.body;

  try {
    // Check if admin user
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to send exam links" });
    }

    // Find the exam
    const exam = await Exam.findOne({
      _id: examId,
      createdBy: req.user.userId,
    });

    if (!exam) {
      return res.status(404).json({ msg: `No exam found with id ${examId}` });
    }

    let students = [];
    // If specific students are provided
    if (studentIds && studentIds.length > 0) {
      students = await Student.find({
        _id: { $in: studentIds },
        createdBy: req.user.userId,
      });
    } else {
      // Send to all students
      students = await Student.find({
        createdBy: req.user.userId,
        isBlocked: false,
      });
    }

    if (students.length === 0) {
      return res
        .status(404)
        .json({ msg: "No students found to send exam link" });
    }

    // Use localhost:5173 for the client URL
    const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // Generate and send emails
    const emailPromises = students.map(async (student) => {
      // Create the exam link
      const examLink = `${clientBaseUrl}/login/student`;

      // Get student's password - you have two options:

      // OPTION 1: If you store passwords in plain text (not recommended for security)
      // const password = student.password;

      // OPTION 2: Generate a temporary password for the exam (more secure)
      // This requires updating your Student model to support temp passwords
      const tempPassword = generateTemporaryPassword(); // Implement this function
      await Student.findByIdAndUpdate(student._id, {
        tempExamPassword: tempPassword,
        tempPasswordExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      });

      const subject = `Exam Access Information: ${exam.title}`;
      const html = `
            <h1>Exam Access Information</h1>
            <p>Dear ${student.name},</p>
            <p>You have been invited to take the exam: <strong>${exam.title}</strong></p>
            
            <p>Exam Details:</p>
            <ul>
              <li>Title: ${exam.title}</li>
              <li>Start Time: ${new Date(exam.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</li>
              <li>Duration: ${exam.duration} minutes</li>
            </ul>
            
            <div style="background-color: #f5f5f5; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Login Information</h3>
              <p><strong>Student ID:</strong> ${student.studentId}</p>
              <p><strong>Password:</strong> ${tempPassword}</p>
              <p><strong>Exam ID:</strong> ${examId}</p>
            </div>
            
            <p><strong>Instructions:</strong></p>
            <ol>
              <li>Click the link below to access the student login page</li>
              <li>Enter your Student ID and Password provided above</li>
              <li>Enter the Exam ID provided above</li>
              <li>You will be directly taken to the exam instructions</li>
            </ol>
            
            <a href="${examLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Go to Student Login</a>
            
            <p>Or copy this URL into your browser:</p>
            <p><code>${examLink}</code></p>
            
            <p>Good luck!</p>
            <hr>
            <p style="font-size: 12px; color: #666;">If you have any issues accessing the exam, please contact your administrator.</p>
            <p style="font-size: 12px; color: #666;">This password is temporary and will expire after 24 hours.</p>
          `;

      // Use Juvlon API (sendSingleEmail) if API key is configured, otherwise try nodemailer fallback
      if (API_KEY) {
        return await sendSingleEmail(student.email, subject, html);
      } else {
        // Fallback: attempt to send via nodemailer using SMTP env vars
        // Create transporter using common SMTP env vars if present
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: process.env.SMTP_USER
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
          });

          const mailOptions = {
            from: FROM_EMAIL || process.env.EMAIL_FROM || 'no-reply@example.com',
            to: student.email,
            subject,
            html,
          };

          return await transporter.sendMail(mailOptions);
        } catch (smtpErr) {
          console.error('SMTP fallback failed for', student.email, smtpErr);
          throw smtpErr;
        }
      }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Log preview URLs for development
    if (process.env.NODE_ENV !== "production") {
      emailPromises.forEach(async (promise, index) => {
        try {
          const info = await promise;
          const recipient = students[index]?.email || 'unknown';
          console.log(`Email send attempt finished for ${recipient}`);

          // Juvlon returns JSON with a status/result, nodemailer returns messageId etc.
          if (info?.messageId) {
            console.log(`✔ Nodemailer messageId ${info.messageId}`);
          }
          if (info?.status) {
            console.log(`✔ Juvlon status: ${info.status}`);
          }

          if (nodemailer.getTestMessageUrl && info) {
            const previewURL = nodemailer.getTestMessageUrl(info);
            if (previewURL) {
              console.log(`Preview URL: ${previewURL}`);
            }
          }
        } catch (e) {
          const recipient = students[index]?.email || 'unknown';
          console.error(`Failed to send email to ${recipient}:`, e.message || e);
        }
      });
    }

    res.status(200).json({
      msg: "Exam links sent successfully",
      sentTo: students.length,
    });
  } catch (error) {
    console.error("Error sending exam links:", error);
    res.status(500).json({ msg: "Something went wrong, try again later" });
  }
};

// Function to generate a random temporary password
function generateTemporaryPassword(length = 8) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Get all exam results
const getExamResults = async (req, res) => {
  const { examId } = req.params;

  try {
    // Check if admin user
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to view results" });
    }

    // Find the exam
    const exam = await Exam.findOne({
      _id: examId,
      createdBy: req.user.userId,
    });

    if (!exam) {
      return res.status(404).json({ msg: `No exam found with id ${examId}` });
    }

    // Get all results for this exam
    const results = await Result.find({ exam: examId })
      .populate("student", "name studentId email")
      .sort({ submittedAt: -1 });

    res.status(200).json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong, try again later" });
  }
};

const xlsx = require("xlsx");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Import students from Excel file
const importStudentsFromExcel = async (req, res) => {
  try {
    // Check if admin user
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to import students" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload an Excel file" });
    }

    const filePath = req.file.path;

    try {
      // Read Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        // Delete the file after processing
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Excel file is empty" });
      }

      // Validate headers/columns
      const requiredFields = ['name', 'email', 'studentId'];
      const firstRow = data[0];
      
      const missingFields = requiredFields.filter(field => !Object.keys(firstRow).includes(field));
      if (missingFields.length > 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ 
          error: `Missing required columns: ${missingFields.join(', ')}. 
                  Please ensure your Excel file has columns for name, email, and studentId.`
        });
      }

      // Process student data
      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      // Track existing students to avoid duplicates
      const existingEmails = new Set();
      const existingStudentIds = new Set();

      // Get existing students to check for duplicates
      const existingStudents = await Student.find({ createdBy: req.user.userId });
      existingStudents.forEach(student => {
        existingEmails.add(student.email.toLowerCase());
        existingStudentIds.add(student.studentId.toLowerCase());
      });

      // Process each row
      const studentsToCreate = [];
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate required fields
          if (!row.name || !row.email || !row.studentId) {
            results.failed++;
            results.errors.push({
              row: i + 2, // +2 because Excel starts at 1 and header is row 1
              error: "Missing required fields (name, email, or studentId)"
            });
            continue;
          }

          // Validate email format
          const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!emailRegex.test(row.email)) {
            results.failed++;
            results.errors.push({
              row: i + 2,
              error: "Invalid email format"
            });
            continue;
          }

          // Check for duplicate emails or student IDs in the current import
          const email = row.email.toLowerCase();
          const studentId = String(row.studentId).toLowerCase();
          
          if (existingEmails.has(email)) {
            results.failed++;
            results.errors.push({
              row: i + 2,
              email: row.email,
              error: "Email already exists"
            });
            continue;
          }

          if (existingStudentIds.has(studentId)) {
            results.failed++;
            results.errors.push({
              row: i + 2,
              studentId: row.studentId,
              error: "Student ID already exists"
            });
            continue;
          }

          // Generate password if not provided
          const password = row.password || crypto.randomBytes(4).toString('hex');
          
          // Add to tracking sets to prevent duplicates within this import
          existingEmails.add(email);
          existingStudentIds.add(studentId);

          // Add to the list of students to create
          studentsToCreate.push({
            name: row.name.trim(),
            email: email,
            studentId: studentId,
            password: password, // Will be hashed by the model pre-save hook
            createdBy: req.user.userId,
          });

          results.success++;
        } catch (rowError) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            error: rowError.message || "Unknown error processing row"
          });
        }
      }

      // Create all valid students
      if (studentsToCreate.length > 0) {
        await Student.create(studentsToCreate);
      }

      // Delete the file after processing
      fs.unlinkSync(filePath);

      return res.status(200).json({
        message: `Successfully processed ${data.length} entries`,
        results: {
          total: data.length,
          successful: results.success,
          failed: results.failed,
          errors: results.errors.length > 0 ? results.errors : undefined,
        }
      });

    } catch (excelError) {
      console.error("Error processing Excel file:", excelError);
      res
        .status(400)
        .json({ error: "Error processing Excel file: " + excelError.message });

      // Clean up the file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error("Error in importStudentsFromExcel:", error);

    // Delete the file if it exists and there was an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  toggleBlockStudent,
  sendExamLink,
  getExamResults,
  importStudentsFromExcel,
  sendBulkEmails,
};
