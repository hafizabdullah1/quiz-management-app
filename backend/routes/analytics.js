import express from 'express';
import Quiz from '../models/Quiz.js';
import StudentSession from '../models/StudentSession.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateObjectId, validatePagination } from '../middleware/validation.js';
import { requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Apply teacher middleware to all routes
router.use(requireTeacher);

// @route   GET /api/analytics/quiz/:id
// @desc    Get detailed analytics for a specific quiz
// @access  Private (Teacher only)
router.get('/quiz/:id', validateObjectId, asyncHandler(async (req, res) => {
  const quizId = req.params.id;

  // Verify quiz belongs to teacher
  const quiz = await Quiz.findOne({
    _id: quizId,
    teacher: req.user._id
  });

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found'
    });
  }

  // Get session statistics
  const [totalSessions, completedSessions, abandonedSessions, blockedSessions] = await Promise.all([
    StudentSession.countDocuments({ quiz: quizId }),
    StudentSession.countDocuments({ quiz: quizId, status: 'completed' }),
    StudentSession.countDocuments({ quiz: quizId, status: 'abandoned' }),
    StudentSession.countDocuments({ quiz: quizId, status: 'blocked' })
  ]);

  // Get performance metrics
  const performanceMetrics = await StudentSession.aggregate([
    {
      $match: {
        quiz: quizId,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
        averagePercentage: { $avg: '$percentage' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        totalTabShifts: { $sum: '$tabShiftCount' },
        suspiciousSessions: { $sum: { $cond: ['$suspiciousActivity', 1, 0] } },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);

  const metrics = performanceMetrics[0] || {
    averageScore: 0,
    averagePercentage: 0,
    highestScore: 0,
    lowestScore: 0,
    totalTabShifts: 0,
    suspiciousSessions: 0,
    averageDuration: 0
  };

  // Get question-wise performance
  const questionPerformance = await StudentSession.aggregate([
    {
      $match: {
        quiz: quizId,
        status: 'completed'
      }
    },
    {
      $unwind: '$answers'
    },
    {
      $group: {
        _id: '$answers.questionId',
        totalAttempts: { $sum: 1 },
        correctAnswers: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
        averageTimeSpent: { $avg: '$answers.timeSpent' }
      }
    },
    {
      $lookup: {
        from: 'quizzes',
        localField: '_id',
        foreignField: 'questions._id',
        as: 'question'
      }
    }
  ]);

  res.json({
    status: 'success',
    data: {
      quiz: {
        id: quiz._id,
        title: quiz.title,
        totalPoints: quiz.totalPoints,
        questionCount: quiz.questionCount
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        abandoned: abandonedSessions,
        blocked: blockedSessions
      },
      performance: {
        averageScore: Math.round(metrics.averageScore * 100) / 100,
        averagePercentage: Math.round(metrics.averagePercentage * 100) / 100,
        highestScore: metrics.highestScore,
        lowestScore: metrics.lowestScore,
        totalTabShifts: metrics.totalTabShifts,
        suspiciousSessions: metrics.suspiciousSessions,
        averageDuration: Math.round(metrics.averageDuration)
      },
      questionPerformance
    }
  });
}));

// @route   GET /api/analytics/quiz/:id/sessions
// @desc    Get all student sessions for a quiz with detailed analytics
// @access  Private (Teacher only)
router.get('/quiz/:id/sessions', validateObjectId, validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const quizId = req.params.id;

  // Verify quiz belongs to teacher
  const quiz = await Quiz.findOne({
    _id: quizId,
    teacher: req.user._id
  });

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found'
    });
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [sessions, total] = await Promise.all([
    StudentSession.find({ quiz: quizId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('studentName studentEmail sessionId startTime endTime duration score maxScore percentage status tabShiftCount suspiciousActivity warnings createdAt'),
    StudentSession.countDocuments({ quiz: quizId })
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    status: 'success',
    data: {
      sessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
}));

// @route   GET /api/analytics/overview
// @desc    Get overview analytics for all teacher's quizzes
// @access  Private (Teacher only)
router.get('/overview', asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  // Get overall statistics
  const [totalQuizzes, totalSessions, totalStudents] = await Promise.all([
    Quiz.countDocuments({ teacher: teacherId }),
    StudentSession.countDocuments({ quiz: { $in: await Quiz.find({ teacher: teacherId }).select('_id') } }),
    StudentSession.distinct('studentName', { quiz: { $in: await Quiz.find({ teacher: teacherId }).select('_id') } })
  ]);

  // Get performance overview
  const performanceOverview = await StudentSession.aggregate([
    {
      $match: {
        quiz: { $in: await Quiz.find({ teacher: teacherId }).select('_id') },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalCompleted: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averagePercentage: { $avg: '$percentage' },
        totalTabShifts: { $sum: '$tabShiftCount' },
        suspiciousSessions: { $sum: { $cond: ['$suspiciousActivity', 1, 0] } }
      }
    }
  ]);

  const overview = performanceOverview[0] || {
    totalCompleted: 0,
    averageScore: 0,
    averagePercentage: 0,
    totalTabShifts: 0,
    suspiciousSessions: 0
  };

  // Get recent activity
  const recentActivity = await StudentSession.find({
    quiz: { $in: await Quiz.find({ teacher: teacherId }).select('_id') }
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('quiz', 'title')
    .select('studentName score percentage status createdAt quiz');

  // Get quiz performance ranking
  const quizRanking = await Quiz.aggregate([
    {
      $match: { teacher: teacherId }
    },
    {
      $lookup: {
        from: 'studentsessions',
        localField: '_id',
        foreignField: 'quiz',
        as: 'sessions'
      }
    },
    {
      $project: {
        title: 1,
        attemptsCount: { $size: '$sessions' },
        averageScore: {
          $cond: [
            { $gt: [{ $size: '$sessions' }, 0] },
            { $avg: '$sessions.score' },
            0
          ]
        }
      }
    },
    {
      $sort: { averageScore: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.json({
    status: 'success',
    data: {
      overview: {
        totalQuizzes,
        totalSessions,
        uniqueStudents: totalStudents.length,
        totalCompleted: overview.totalCompleted,
        averageScore: Math.round(overview.averageScore * 100) / 100,
        averagePercentage: Math.round(overview.averagePercentage * 100) / 100,
        totalTabShifts: overview.totalTabShifts,
        suspiciousSessions: overview.suspiciousSessions
      },
      recentActivity,
      topPerformingQuizzes: quizRanking
    }
  });
}));

// @route   GET /api/analytics/export/:quizId
// @desc    Export quiz results as CSV data
// @access  Private (Teacher only)
router.get('/export/:quizId', validateObjectId, asyncHandler(async (req, res) => {
  const quizId = req.params.id;

  // Verify quiz belongs to teacher
  const quiz = await Quiz.findOne({
    _id: quizId,
    teacher: req.user._id
  });

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found'
    });
  }

  // Get all completed sessions
  const sessions = await StudentSession.find({
    quiz: quizId,
    status: 'completed'
  }).select('studentName studentEmail startTime endTime duration score maxScore percentage tabShiftCount suspiciousActivity answers');

  // Prepare CSV data
  const csvData = sessions.map(session => ({
    studentName: session.studentName,
    studentEmail: session.studentEmail || '',
    startTime: session.startTime.toISOString(),
    endTime: session.endTime.toISOString(),
    duration: session.duration,
    score: session.score,
    maxScore: session.maxScore,
    percentage: session.percentage,
    tabShiftCount: session.tabShiftCount,
    suspiciousActivity: session.suspiciousActivity ? 'Yes' : 'No',
    questionsAnswered: session.answers.length
  }));

  res.json({
    status: 'success',
    data: {
      quiz: {
        title: quiz.title,
        totalQuestions: quiz.questionCount,
        totalPoints: quiz.totalPoints
      },
      sessions: csvData,
      totalSessions: csvData.length
    }
  });
}));

export default router;
