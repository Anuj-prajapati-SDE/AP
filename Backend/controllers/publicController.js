const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Student = require('../models/Student');

// Get recent exams for homepage
const getRecentExams = async (req, res) => {
  try {
    // Get current time
    const now = new Date();
    
    // Find active exams that started recently or will start soon
    const recentExams = await Exam.aggregate([
      { 
        $match: { 
          isActive: true,
          // Exams from the last 7 days and upcoming 14 days
          startTime: { 
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
          }
        } 
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          startTime: 1,
          duration: 1,
          activeDuration: 1,
          createdAt: 1,
          totalMarks: 1,
          questionsCount: { $size: "$questions" }
        }
      },
      {
        $sort: { startTime: 1 }
      },
      {
        $limit: 6
      }
    ]);

    // For each exam, get the count of students who attempted it
    const examsWithParticipants = await Promise.all(
      recentExams.map(async (exam) => {
        const participantsCount = await Result.countDocuments({ 
          exam: exam._id,
          status: { $in: ['completed', 'inprogress'] }
        });
        
        // Format date for display
        const startDate = new Date(exam.startTime);
        const formattedDate = startDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        
        return {
          _id: exam._id,
          title: exam.title,
          description: exam.description,
          date: formattedDate,
          participants: participantsCount,
          totalMarks: exam.totalMarks,
          questionsCount: exam.questionsCount,
          isUpcoming: startDate > now
        };
      })
    );

    res.status(200).json({ exams: examsWithParticipants });
  } catch (error) {
    console.error('Error fetching recent exams:', error);
    res.status(500).json({ msg: 'Failed to fetch recent exams' });
  }
};

// Improved getTopPerformers function based on your Result schema
const getTopPerformers = async (req, res) => {
  try {
    console.log('Fetching top performers...');
    
    // Find top results with highest scores, using the actual Result schema fields
    const topResults = await Result.aggregate([
      {
        $match: { 
          status: 'completed',
          totalScore: { $exists: true },
          percentage: { $exists: true, $gt: 0 },
          isPartial: { $ne: true } // Exclude partial submissions
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $lookup: {
          from: 'exams',
          localField: 'exam',
          foreignField: '_id',
          as: 'examInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $unwind: '$examInfo'
      },
      {
        $project: {
          _id: 1,
          student: '$studentInfo.name',
          studentId: '$studentInfo._id',
          profileImage: '$studentInfo.profileImage',
          examTitle: '$examInfo.title',
          examId: '$examInfo._id',
          totalScore: 1,          // Using actual totalScore field from your schema
          percentage: 1,          // Using actual percentage field from your schema
          submittedAt: 1,
          status: 1
        }
      },
      {
        $sort: { 
          percentage: -1,         // Sort by percentage first
          totalScore: -1,         // Then by total score for tie-breaking
          submittedAt: 1          // Then by submission time (earliest first)
        }
      },
      {
        $limit: 5
      }
    ]);

    console.log(`Found ${topResults.length} top performers`);
    
    // Format the data for API response
    const formattedResults = topResults.map(result => ({
      _id: result._id,
      student: result.student,
      studentId: result.studentId,
      profileImage: result.profileImage,
      examTitle: result.examTitle,
      examId: result.examId,
      totalScore: result.totalScore,
      percentage: parseFloat(result.percentage.toFixed(1)), // Format to one decimal place
      submittedAt: result.submittedAt ? new Date(result.submittedAt).toISOString() : null
    }));

    res.status(200).json({ topPerformers: formattedResults });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ msg: 'Failed to fetch top performers' });
  }
};

// Get platform stats for homepage
const getPlatformStats = async (req, res) => {
  try {
    console.log('Fetching platform statistics...');
    
    const examCount = await Exam.countDocuments({ isActive: true });
    const studentCount = await Student.countDocuments();
    
    // Improved result counts using your schema
    const completedExams = await Result.countDocuments({ 
      status: 'completed',
      isPartial: { $ne: true } // Exclude partial submissions
    });
    
    // Calculate average score
    const scoreAggregate = await Result.aggregate([
      {
        $match: {
          status: 'completed',
          percentage: { $exists: true },
          isPartial: { $ne: true } // Exclude partial submissions
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$percentage' }, // Using actual percentage field
          averageTotalScore: { $avg: '$totalScore' },
          totalSubmissions: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Score aggregation results:', scoreAggregate);
    
    // Get data from aggregation or use defaults if no data
    const stats = scoreAggregate.length > 0 ? {
      averageScore: parseFloat(scoreAggregate[0].averageScore.toFixed(1)),
      averageTotalScore: parseFloat(scoreAggregate[0].averageTotalScore.toFixed(1)),
      totalSubmissions: scoreAggregate[0].totalSubmissions
    } : {
      averageScore: 0,
      averageTotalScore: 0,
      totalSubmissions: 0
    };

    // Get the number of exams currently available (started but not expired)
    const now = new Date();
    const availableExams = await Exam.countDocuments({ 
      isActive: true,
      startTime: { $lte: now },
      $expr: {
        $gt: [
          { $add: ["$startTime", { $multiply: ["$activeDuration", 60, 60, 1000] }] },
          now
        ]
      }
    });

    res.status(200).json({
      examCount,
      studentCount,
      completedExams,
      availableExams,
      averageScore: stats.averageScore,
      averageTotalScore: stats.averageTotalScore,
      totalSubmissions: stats.totalSubmissions,
      // Add current date for reference
      currentTime: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ msg: 'Failed to fetch platform stats' });
  }
};

module.exports = {
  getRecentExams,
  getTopPerformers,
  getPlatformStats
};