const Exam = require('../models/Exam');
const Result = require('../models/Result');

// Get available exams for student
const getAvailableExams = async (req, res) => {
  try {
    // Check if student user
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Get current time
    const now = new Date();
    // For testing purposes - uncomment to test with specific date
    // const now = new Date("2025-04-21T06:47:02.000Z");

    console.log("Current time for comparison:", now.toISOString());
    console.log("User ID:", req.user.userId);

    // Get all active exams
    const exams = await Exam.find({ isActive: true }).select('-questions.correctOption');

    // Get completed exams for this student
    const completedResults = await Result.find({
      student: req.user.userId,
      status: 'completed',
    }).populate('exam', 'title description startTime duration activeDuration');

    // Create a map of completed exam IDs for quick lookup
    const completedExamMap = new Map();
    completedResults.forEach(result => {
      if (result.exam && result.exam._id) {
        completedExamMap.set(result.exam._id.toString(), {
          score: result.score,
          totalQuestions: result.totalQuestions,
          submittedAt: result.submittedAt
        });
      }
    });

    // Categorize exams
    const categorizedExams = {
      upcoming: [],
      available: [],
      ended: [],
      completed: []
    };

    // Process exams and categorize them
    exams.forEach(exam => {
      try {
        const examId = exam._id.toString();
        const startTime = new Date(exam.startTime);
        const examEndTime = new Date(startTime);
        examEndTime.setHours(examEndTime.getHours() + exam.activeDuration);

        console.log(`Processing exam ${exam.title} (${examId}):`);
        console.log(`- Start time: ${startTime.toISOString()}`);
        console.log(`- End time: ${examEndTime.toISOString()}`);

        // Check if student attempted or completed this exam
        const isCompleted = completedExamMap.has(examId);
        const isAttempted = exam.studentsAttempted &&
          exam.studentsAttempted.some(id => id.toString() === req.user.userId);

        console.log(`- Is completed: ${isCompleted}`);
        console.log(`- Is attempted: ${isAttempted}`);

        // Determine exam status
        let status, category;

        // FIRST PRIORITY: Check if completed
        if (isCompleted) {
          status = 'Completed';
          category = 'completed';
          console.log(`- Categorized as: Completed (student has completed this exam)`);
        }
        // SECOND PRIORITY: Check date ranges if not completed
        else if (now < startTime) {
          // If current time is before start time, it's upcoming
          status = 'Upcoming';
          category = 'upcoming';
          console.log(`- Categorized as: Upcoming`);
        }
        else if (now > examEndTime) {
          // If current time is after end time, it's expired
          status = 'Expired';
          category = 'ended';
          console.log(`- Categorized as: Expired (after end time, student did NOT complete it)`);
        }
        else {
          // If current time is between start and end time, it's available
          // Check if attempted but not completed
          if (isAttempted) {
            status = 'In Progress';
          } else {
            status = 'Available';
          }
          category = 'available';
          console.log(`- Categorized as: ${status} (within active window)`);
        }

        // Calculate time information
        const timeUntilStart = startTime - now;
        const timeUntilUnavailable = examEndTime - now;

        // Create exam object with time information
        const examWithTimeInfo = {
          ...exam._doc,
          status,
          isAttempted,
          timeUntilStart: timeUntilStart > 0 ? {
            hours: Math.floor(timeUntilStart / (1000 * 60 * 60)),
            minutes: Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60)),
            formatted: formatTimeRemaining(timeUntilStart)
          } : null,
          timeRemaining: timeUntilUnavailable > 0 ? {
            hours: Math.floor(timeUntilUnavailable / (1000 * 60 * 60)),
            minutes: Math.floor((timeUntilUnavailable % (1000 * 60 * 60)) / (1000 * 60)),
            formatted: formatTimeRemaining(timeUntilUnavailable)
          } : null,
          examEndTime: examEndTime
        };

        // If completed, add score information
        if (isCompleted) {
          const resultInfo = completedExamMap.get(examId);
          examWithTimeInfo.score = resultInfo.score;
          examWithTimeInfo.totalQuestions = resultInfo.totalQuestions;
          examWithTimeInfo.submittedAt = resultInfo.submittedAt;
        }

        // Add to appropriate category
        categorizedExams[category].push(examWithTimeInfo);
      } catch (err) {
        console.error(`Error processing exam ${exam._id}:`, err);
        // Skip this exam if there was an error processing it
      }
    });

    // Sort the exams in each category
    categorizedExams.upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    categorizedExams.available.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    categorizedExams.ended.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    categorizedExams.completed.sort((a, b) => new Date(b.submittedAt || b.startTime) - new Date(a.submittedAt || a.startTime));

    res.status(200).json({
      exams: categorizedExams,
      count: {
        upcoming: categorizedExams.upcoming.length,
        available: categorizedExams.available.length,
        ended: categorizedExams.ended.length,
        completed: categorizedExams.completed.length,
        total: Object.values(categorizedExams).reduce((sum, arr) => sum + arr.length, 0)
      },
      currentTime: now // Send current server time for reference
    });
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ msg: 'Something went wrong, try again later' });
  }
};

// Helper function to format time remaining
function formatTimeRemaining(timeInMs) {
  if (timeInMs <= 0) return "0m";

  const days = Math.floor(timeInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Add this to your studentController.js
const checkExam = async (req, res) => {
  const { examId } = req.body;

  try {
    if (!examId) {
      return res.status(400).json({ msg: 'No exam ID provided' });
    }

    // Find the exam
    const exam = await Exam.findOne({ _id: examId });

    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    // Check if exam has already ended
    const currentTime = new Date();
    const examEndTime = new Date(exam.startTime);
    examEndTime.setMinutes(examEndTime.getMinutes() + exam.duration);

    if (currentTime > examEndTime) {
      return res.status(403).json({
        status: 'expired',
        msg: 'This exam has already ended and is no longer available.'
      });
    }

    // Check if the exam is available to start (within 15 minutes of start time)
    const examStartTime = new Date(exam.startTime);
    const preAccessTime = new Date(examStartTime);
    preAccessTime.setMinutes(preAccessTime.getMinutes() - 15); // 15 min early access

    if (currentTime < preAccessTime) {
      // Calculate time remaining until exam is available
      const timeRemaining = preAccessTime - currentTime;
      const minutesRemaining = Math.floor(timeRemaining / 60000);

      return res.status(403).json({
        status: 'not-started',
        msg: `This exam will be available to start in approximately ${minutesRemaining} minutes.`,
        availableAt: examStartTime
      });
    }

    // If student has already submitted this exam
    const existingResult = await Result.findOne({
      studentId: req.user.userId,
      examId: examId
    });

    if (existingResult) {
      return res.status(403).json({
        status: 'already-submitted',
        msg: 'You have already completed this exam.',
        result: existingResult
      });
    }

    // Otherwise, exam is available
    return res.status(200).json({
      status: 'available',
      msg: 'Exam is available',
      examDetails: {
        title: exam.title,
        duration: exam.duration,
        startTime: exam.startTime,
        endTime: examEndTime
      }
    });

  } catch (error) {
    console.error('Error checking exam availability:', error);
    res.status(500).json({ msg: 'Server error, please try again' });
  }
};

module.exports = {
  getAvailableExams,
  checkExam,
};