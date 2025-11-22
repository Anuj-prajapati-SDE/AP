const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide student'],
  },
  exam: {
    type: mongoose.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Please provide exam'],
  },
  answers: {
    type: [{
      questionId: String,
      selectedOption: Number,
      isCorrect: Boolean,
      marks: Number,
    }],
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['completed', 'inprogress', 'notstarted'],
    default: 'notstarted',
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  isPartial: {
    type: Boolean,
    default: false
  },
  partialReason: {
    type: String
  }
});

module.exports = mongoose.model('Result', ResultSchema);