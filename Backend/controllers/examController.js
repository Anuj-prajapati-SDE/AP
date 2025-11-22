const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Student = require('../models/Student');
const ResultView = require('../models/ResultView');
const mongoose = require('mongoose');

// Create new exam
const createExam = async (req, res) => {
  const { title, description, startTime, duration, questions , activeDuration } = req.body;

  try {
    // Check if admin user
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to create exams' });
    }

    const existingExam = await Exam.findOne({
      title,
      createdBy: req.user.userId,
    });

    if (existingExam) {
      return res.status(400).json({ msg: 'You already have an exam with this title' });
    }

    const exam = await Exam.create({
      title,
      description,
      startTime,
      duration,
      questions,
      activeDuration,
      createdBy: req.user.userId,
    });
    console.log(activeDuration)

    res.status(201).json({ exam });
  } catch (error) {
    res.status(500).json({ msg: 'Something went wrong, try again later' });
  }
};

// Update existing exam (admin only)
const updateExam = async (req, res) => {
  const { id: examId } = req.params;
  const updates = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to edit exams' });
    }

    const exam = await Exam.findOne({ _id: examId, createdBy: req.user.userId });

    if (!exam) {
      return res.status(404).json({ msg: `No exam found with id ${examId}` });
    }

    const now = new Date();
    if (now >= new Date(exam.startTime)) {
      return res.status(403).json({ msg: 'Exam cannot be edited after it has started' });
    }

    const availabilityEnd = new Date(exam.startTime);
    availabilityEnd.setHours(availabilityEnd.getHours() + exam.activeDuration);
    if (now > availabilityEnd) {
      return res.status(403).json({ msg: 'Exam can no longer be edited because its active duration has ended' });
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'title') && updates.title !== exam.title) {
      const conflictingExam = await Exam.findOne({
        _id: { $ne: examId },
        title: updates.title,
        createdBy: req.user.userId,
      });

      if (conflictingExam) {
        return res.status(400).json({ msg: 'You already have another exam with this title' });
      }
    }

    const editableFields = ['title', 'description', 'startTime', 'duration', 'activeDuration', 'questions', 'isActive'];
    editableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        exam[field] = updates[field];
      }
    });

    // Recalculate total marks when questions change to keep scoring accurate
    if (Object.prototype.hasOwnProperty.call(updates, 'questions')) {
      exam.totalMarks = exam.questions.reduce((sum, question) => sum + (question.marks || 0), 0);
    }

    await exam.save();

    res.status(200).json({ exam });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ msg: 'Something went wrong, try again later' });
  }
};

// Get all exams (admin)
const getAllExams = async (req, res) => {
  try {
    // Check if admin user
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view all exams' });
    }

    const exams = await Exam.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ exams, count: exams.length });
  } catch (error) {
    res.status(500).json({ msg: 'Something went wrong, try again later' });
  }
};

const getExam = async (req, res) => {
  const { id: examId } = req.params;

  console.log('Fetching exam with ID:', examId, 'for user:', req.user.userId); // Debug log

  try {
    let exam;

    if (req.user.role === 'admin') {
      // Admin can see full exam details
      exam = await Exam.findOne({
        _id: examId,
        createdBy: req.user.userId,
      });

      console.log('Admin requesting exam details. Found:', !!exam); // Debug log
    } else {
      // Student can only see exam if it's active and time is correct
      exam = await Exam.findOne({ _id: examId, isActive: true });

      // Check if exam exists
      if (!exam) {
        console.log('No active exam found with ID:', examId); // Debug log
        return res.status(404).json({ msg: `No exam found with id ${examId}` });
      }

      // Check if exam has started
      const now = new Date();
      const startTime = new Date(exam.startTime);
      console.log('Current time:', now, 'Exam start time:', startTime); // Debug log

      if (now < startTime) {
        const waitTimeMs = startTime - now;
        const waitTimeMinutes = Math.ceil(waitTimeMs / (1000 * 60));

        console.log('Exam has not started yet. Wait time:', waitTimeMinutes, 'minutes'); // Debug log

        return res.status(403).json({
          msg: 'Exam has not started yet',
          startTime: exam.startTime,
          waitTimeMinutes,
        });
      }

      // Check if student already completed this exam
      const result = await Result.findOne({
        student: req.user.userId,
        exam: examId,
        status: 'completed',
      });

      if (result) {
        console.log('Student already completed this exam'); // Debug log
        return res.status(403).json({
          msg: 'You have already completed this exam',
          result: {
            totalScore: result.totalScore,
            percentage: result.percentage,
            submittedAt: result.submittedAt,
          }
        });
      }

      // For student, remove correct answers from response
      exam = exam.toObject();
      exam.questions = exam.questions.map(q => ({
        ...q,
        correctOption: undefined, // Remove correct answer
      }));
    }

    if (!exam) {
      console.log('No exam found with ID:', examId); // Debug log
      return res.status(404).json({ msg: `No exam found with id ${examId}` });
    }

    res.status(200).json({ exam });
  } catch (error) {
    console.error('Error fetching exam:', error); // Debug log
    res.status(500).json({ msg: 'Something went wrong, try again later' });
  }
};

// Start exam for student
const startExam = async (req, res) => {
  const { id: examId } = req.params;

  try {
    // Check if student user
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Not authorized to take exam' });
    }

    // Find the exam
    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({ msg: `No active exam found with id ${examId}` });
    }

    // Check if exam has started
    const now = new Date();
    if (now < exam.startTime) {
      return res.status(403).json({
        msg: 'Exam has not started yet',
        startTime: exam.startTime,
      });
    }

    // Check exam end time (availability window)
    const examEndTime = new Date(exam.startTime);
    examEndTime.setHours(examEndTime.getHours() + exam.activeDuration);

    if (now > examEndTime) {
      return res.status(403).json({
        msg: 'This exam is no longer available for taking',
        endedAt: examEndTime,
      });
    }

    // Check if student already completed this exam
    const existingResult = await Result.findOne({
      student: req.user.userId,
      exam: examId,
    });

    if (existingResult && existingResult.status === 'completed') {
      return res.status(403).json({
        msg: 'You have already completed this exam',
        result: {
          totalScore: existingResult.totalScore,
          percentage: existingResult.percentage,
          submittedAt: existingResult.submittedAt,
        }
      });
    }

    let result;

    if (existingResult && existingResult.status === 'inprogress') {
      // Continue existing attempt
      result = existingResult;
    } else {
      // Create a new exam attempt
      result = await Result.create({
        student: req.user.userId,
        exam: examId,
        startTime: now,
        status: 'inprogress',
      });

      // Add student to studentsAttempted array if not already there
      if (!exam.studentsAttempted.includes(req.user.userId)) {
        exam.studentsAttempted.push(req.user.userId);
        await exam.save();
      }
    }

    // Calculate end time based on exam duration
    const endTime = new Date(result.startTime);
    endTime.setMinutes(endTime.getMinutes() + exam.duration);

    res.status(200).json({
      msg: 'Exam started',
      result: {
        resultId: result._id,
        startTime: result.startTime,
        endTime,
        duration: exam.duration,
      }
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ msg: 'Something went wrong, try again later' });
  }
};

// Submit exam answers
const submitExam = async (req, res) => {
  const { id: examId } = req.params;
  const { answers } = req.body;

  try {
    // Check if student user
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Not authorized to submit exam' });
    }

    // Find the exam
    const exam = await Exam.findOne({ _id: examId, isActive: true });

    if (!exam) {
      return res.status(404).json({ msg: `No active exam found with id ${examId}` });
    }

    // Find the result entry
    const result = await Result.findOne({
      student: req.user.userId,
      exam: examId,
      status: 'inprogress',
    });

    if (!result) {
      return res.status(404).json({ msg: 'No active exam attempt found' });
    }

    // Define negative marking factor (e.g., 0.25 means deduct 25% of the question's marks for wrong answer)
    const NEGATIVE_MARKING_FACTOR = 0.50; 

    // Process answers and calculate score
    const processedAnswers = answers.map(answer => {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      
      // Skip if question not found
      if (!question) return { 
        questionId: answer.questionId, 
        selectedOption: answer.selectedOption,
        isCorrect: false, 
        marks: 0 
      };
      
      const isCorrect = question.correctOption === answer.selectedOption;
      let marks = 0;
      
      if (isCorrect) {
        // Award full marks for correct answer
        marks = question.marks;
      } else if (answer.selectedOption !== undefined && answer.selectedOption !== null) {
        // Apply negative marking only if an option was selected (not for unattempted questions)
        marks = -(question.marks * NEGATIVE_MARKING_FACTOR);
      }

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        marks,
      };
    });

    const totalScore = processedAnswers.reduce((sum, answer) => sum + answer.marks, 0);
    // Ensure score doesn't go negative overall (optional)
    const finalScore = Math.max(0, totalScore);
    const percentage = (finalScore / exam.totalMarks) * 100;

    // Update result
    result.answers = processedAnswers;
    result.totalScore = finalScore;
    result.percentage = percentage;
    result.endTime = new Date();
    result.status = 'completed';
    await result.save();

    res.status(200).json({
      msg: 'Exam submitted successfully',
      result: {
        totalScore: finalScore,
        percentage,
        submittedAt: result.endTime,
      }
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ msg: 'Something went wrong, try again later' });
  }
};

// Log security violations during exam
const logSecurityViolation = async (req, res) => {
  try {
    const { examId } = req.params;
    const { type, timestamp, count } = req.body;

    // Find the student
    const student = await Student.findOne({ _id: req.user.userId });

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Log violation in database
    const violation = new SecurityViolation({
      examId,
      studentId: req.user.userId,
      type,
      timestamp,
      count
    });

    await violation.save();

    // If 3 or more violations, consider blocking the student
    if (count >= 3) {
      // Update student status
      student.securityViolations = (student.securityViolations || 0) + 1;

      if (student.securityViolations >= 3) {
        student.isBlocked = true;
        student.blockReason = 'Multiple security violations across exams';
        student.blockedAt = new Date();
      }

      await student.save();

      // Notify admin (optional)
      // ...
    }

    return res.status(200).json({ msg: 'Security violation logged' });

  } catch (error) {
    console.error('Error logging security violation:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

const checkExamAccess = async (req, res) => {
  try {
    const { examId } = req.params;

    // Set the current time for consistent testing
    // For production, use the line below:
    const currentTime = new Date();
    // For testing with your specific time:
    // const currentTime = new Date("2025-04-21T08:32:09.000Z");

    console.log(`Checking exam access at ${currentTime.toISOString()}`);

    // Find the student
    const student = await Student.findOne({ _id: req.user.userId });

    if (!student) {
      console.log(`Student not found: ${req.user.userId}`);
      return res.status(404).json({
        accessible: false,
        message: 'Student not found'
      });
    }

    // Check if student is blocked
    if (student.isBlocked) {
      console.log(`Student is blocked: ${student.name} (${student._id})`);
      return res.status(403).json({
        accessible: false,
        message: 'Your account has been blocked. Please contact your administrator.'
      });
    }

    // Find the exam
    const exam = await Exam.findOne({ _id: examId });

    if (!exam) {
      console.log(`Exam not found: ${examId}`);
      return res.status(404).json({
        accessible: false,
        message: 'Exam not found'
      });
    }

    // Calculate exam start and availability times
    const examStartTime = new Date(exam.startTime);

    // Calculate the end of the availability window (start time + active duration in hours)
    const availabilityEndTime = new Date(examStartTime);
    availabilityEndTime.setHours(availabilityEndTime.getHours() + exam.activeDuration);

    // Time when students can first access the exam (15 min before start)
    const preAccessTime = new Date(examStartTime);
    preAccessTime.setMinutes(preAccessTime.getMinutes() - 15); // 15 min early access

    console.log(`Exam: ${exam.title} (${examId})`);
    console.log(`- Exam start time: ${examStartTime.toISOString()}`);
    console.log(`- Availability ends: ${availabilityEndTime.toISOString()}`);
    console.log(`- Pre-access time: ${preAccessTime.toISOString()}`);

    // Check if student has already submitted this exam
    const existingResult = await Result.findOne({
      exam: examId,
      student: req.user.userId,
      status: 'completed'
    });

    if (existingResult) {
      console.log(`Student has already completed this exam: ${student.name} (${student._id})`);
      return res.status(403).json({
        accessible: false,
        message: 'You have already completed this exam',
        resultId: existingResult._id
      });
    }

    // Check if the exam's availability period has ended
    if (currentTime > availabilityEndTime) {
      console.log(`Exam availability period has ended. Current time: ${currentTime.toISOString()}, End time: ${availabilityEndTime.toISOString()}`);
      return res.status(403).json({
        accessible: false,
        message: 'This exam is no longer available for taking',
        availableUntil: availabilityEndTime
      });
    }

    // Check if it's too early to access the exam
    if (currentTime < preAccessTime) {
      const timeToStart = Math.ceil((preAccessTime - currentTime) / 60000); // minutes
      console.log(`Too early to access exam. Minutes until available: ${timeToStart}`);

      return res.status(403).json({
        accessible: false,
        message: `This exam will be available in approximately ${timeToStart} minutes`,
        availableAt: examStartTime
      });
    }

    // Calculate exam duration and remaining time
    let examEndTime;
    let remainingTime;

    // Check if the student already has an in-progress attempt
    const inProgressResult = await Result.findOne({
      exam: examId,
      student: req.user.userId,
      status: 'inprogress'
    });

    if (inProgressResult) {
      // Calculate end time based on when they started
      examEndTime = new Date(inProgressResult.startTime);
      examEndTime.setMinutes(examEndTime.getMinutes() + exam.duration);

      // Calculate remaining time
      remainingTime = Math.max(0, Math.floor((examEndTime - currentTime) / 60000));

      console.log(`Student has in-progress attempt. Start time: ${inProgressResult.startTime}`);
      console.log(`End time: ${examEndTime.toISOString()}, Remaining minutes: ${remainingTime}`);

      // Check if their exam time has expired
      if (currentTime > examEndTime) {
        return res.status(403).json({
          accessible: false,
          message: 'Your exam time has expired',
          resultId: inProgressResult._id,
          autoSubmit: true
        });
      }
    } else {
      // New attempt - they'll get the full duration
      examEndTime = new Date(currentTime);
      examEndTime.setMinutes(examEndTime.getMinutes() + exam.duration);
      remainingTime = exam.duration;

      console.log(`New attempt would end at: ${examEndTime.toISOString()}`);
    }

    // Check if starting now would exceed the availability window
    if (examEndTime > availabilityEndTime) {
      // Calculate how many minutes they would actually have
      const availableMinutes = Math.max(0, Math.floor((availabilityEndTime - currentTime) / 60000));

      if (availableMinutes < 5) { // If less than 5 minutes available, consider it unavailable
        console.log(`Not enough time to start exam. Only ${availableMinutes} minutes available.`);
        return res.status(403).json({
          accessible: false,
          message: 'There is not enough time left to complete this exam',
          availableUntil: availabilityEndTime
        });
      }

      console.log(`Limited time available. Full duration: ${exam.duration}, Available: ${availableMinutes}`);

      // Warn them they have limited time
      return res.status(200).json({
        accessible: true,
        message: `You can access this exam but will only have ${availableMinutes} minutes instead of the full ${exam.duration} minutes due to the exam availability window closing soon.`,
        examDetails: {
          title: exam.title,
          duration: availableMinutes, // Limited time
          startTime: examStartTime,
          endTime: availabilityEndTime,
          totalQuestions: exam.questions.length,
          limitedTime: true,
          originalDuration: exam.duration
        }
      });
    }

    // If all checks pass, the student can access the exam with full duration
    console.log(`Student granted access: ${student.name} (${student._id})`);
    return res.status(200).json({
      accessible: true,
      message: 'You can access this exam',
      examDetails: {
        title: exam.title,
        duration: remainingTime || exam.duration,
        startTime: examStartTime,
        endTime: examEndTime,
        totalQuestions: exam.questions.length,
        inProgress: !!inProgressResult,
        resultId: inProgressResult ? inProgressResult._id : null
      }
    });

  } catch (error) {
    console.error('Error checking exam access:', error);
    return res.status(500).json({
      accessible: false,
      message: 'Server error, please try again later'
    });
  }
};

const getExamResult = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.userId;

    // Find the exam
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        msg: 'Exam not found'
      });
    }

    // Find the result for this student and exam
    const result = await Result.findOne({
      exam: examId,
      student: studentId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        msg: 'You have not taken this exam yet'
      });
    }

    // Prepare the response data
    const resultData = {
      id: result._id,
      examId: result.examId,
      examTitle: exam.title,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken || null,
      submittedAt: result.submittedAt,
      isPartial: result.isPartial || false,
      partialReason: result.partialReason || null,
      answers: result.answers
    };

    // Log this view for analytics
    await new ResultView({
      resultId: result._id,
      studentId: studentId,
      viewedAt: new Date(),
      userInfo: {
        name: req.user.name,
        studentId: req.user.studentId
      }
    }).save();

    // Return the result data
    return res.status(200).json({
      success: true,
      result: resultData
    });

  } catch (error) {
    console.error('Error fetching exam result:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error, please try again later'
    });
  }
};

// Delete an exam and its associated results
const deleteExam = async (req, res) => {
  try {
    const { id: examId } = req.params;
    
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete exams' });
    }
    
    // Find the exam first to check if it exists
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).json({ msg: `No exam found with id ${examId}` });
    }
    
    // Delete the exam
    await Exam.findByIdAndDelete(examId);
    
    // Also delete any results associated with this exam
    // Assuming you have a Result model - adjust as needed for your schema
    if (mongoose.models.Result) {
      await mongoose.models.Result.deleteMany({ exam: examId });
    }
    
    res.status(200).json({ msg: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ msg: 'Something went wrong, please try again' });
  }
};


module.exports = {
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
};