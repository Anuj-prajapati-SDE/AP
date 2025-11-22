const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Please provide options'],
    validate: [(val) => val.length === 4, 'Please provide exactly 4 options'],
  },
  correctOption: {
    type: Number,
    required: [true, 'Please provide the correct option index (0-3)'],
    min: 0,
    max: 3,
  },
  marks: {
    type: Number,
    default: 1,
  },
});

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an exam title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time'],
  },
  duration: {
    type: Number, // duration in minutes for taking the exam
    required: [true, 'Please provide duration'],
    min: 1,
  },
  activeDuration: {
    type: Number, // duration in hours the exam is available after start time
    required: [true, 'Please provide active duration'],
    default: 24, // Default to 24 hours
    min: 1,
  },
  questions: {
    type: [QuestionSchema],
    validate: [(val) => val.length > 0, 'Please add at least one question'],
  },
  totalMarks: {
    type: Number,
    default: function () {
      return this.questions.reduce((sum, question) => sum + question.marks, 0);
    },
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Please provide admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Added field to track students who have attempted this exam
  studentsAttempted: [{
    type: mongoose.Types.ObjectId,
    ref: 'Student'
  }]
});

module.exports = mongoose.model('Exam', ExamSchema);