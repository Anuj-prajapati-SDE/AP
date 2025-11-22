const mongoose = require('mongoose');

const ResultViewSchema = new mongoose.Schema({
  resultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  },
  userInfo: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('ResultView', ResultViewSchema);