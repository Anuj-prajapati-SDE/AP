const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
// const studentRoutes = require('./routes/student');
const examRoutes = require('./routes/exam');
// const resultRoutes = require('./routes/result');
const authenticateUser = require('./middleware/authentication');
const Admin = require('./models/Admin');
const studentRoutes = require('./routes/student');


// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Create Admin function
const createInitialAdmin = async () => {
  try {
    // Check if admin already exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('Admin account already exists, skipping creation');
      return;
    }

    // Create default admin if none exists
    
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@assessment.com',
      password: 'admin@123',
    });
    
    console.log(`Default admin created: ${admin.email} with password: ${admin.password}`);
    console.log('Please change the password after first login for security');
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
};

// Routes
app.use('/api/v1/auth', authRoutes);
// Uncomment the student routes in server.js
app.use('/api/v1/student', authenticateUser, studentRoutes);
app.use('/api/v1/admin', authenticateUser, adminRoutes);
// app.use('/api/v1/student', authenticateUser, studentRoutes);
app.use('/api/v1/exam', authenticateUser, examRoutes);
// app.use('/api/v1/result', authenticateUser, resultRoutes);
app.use('/api/v1/public', require('./routes/publicRoutes'));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/', (req, res) => {
  res.send('Assessment Tool Backend is running');
});


// Connect to MongoDB
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');
    
    // Create initial admin user
    await createInitialAdmin();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

start();