import express from 'express';
import Quiz from '../models/Quiz.js';
import StudentSession from '../models/StudentSession.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateQuizCreation, validateQuizUpdate, validateObjectId, validatePagination, validateSearch } from '../middleware/validation.js';
import { requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Apply teacher middleware to all routes
router.use(requireTeacher);

// @route   POST /api/teacher/quizzes
// @desc    Create a new quiz
// @access  Private (Teacher only)
router.post('/quizzes', validateQuizCreation, asyncHandler(async (req, res) => {
  // Sanitize incoming payload to avoid numeric ids being cast to ObjectId
  const sanitizeQuestions = (questions = []) =>
    questions.map((q) => {
      const { _id, id, options, ...restQ } = q
      const cleanOptions = Array.isArray(options)
        ? options.map((opt) => {
            const { _id: oId, id: oVid, text, isCorrect } = opt || {}
            return { text, isCorrect: !!isCorrect }
          })
        : undefined
      return { ...restQ, options: cleanOptions }
    })

  const quizData = {
    ...req.body,
    questions: sanitizeQuestions(req.body.questions),
    teacher: req.user._id
  };

  const quiz = new Quiz(quizData);
  await quiz.save();

  res.status(201).json({
    status: 'success',
    message: 'Quiz created successfully',
    data: {
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        shareableLink: quiz.shareableLink,
        questionCount: quiz.questionCount,
        totalPoints: quiz.totalPoints,
        timeLimit: quiz.timeLimit,
        isActive: quiz.isActive,
        createdAt: quiz.createdAt
      }
    }
  });
}));

// @route   GET /api/teacher/quizzes
// @desc    Get all quizzes for the authenticated teacher
// @access  Private (Teacher only)
router.get('/quizzes', validatePagination, validateSearch, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', q, category, difficulty } = req.query;

  // Build filter
  const filter = { teacher: req.user._id };
  
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }
  
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }
  
  if (difficulty) {
    filter.difficulty = difficulty;
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title description shareableLink questionCount totalPoints timeLimit isActive createdAt updatedAt attemptsCount averageScore'),
    Quiz.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    status: 'success',
    data: {
      quizzes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
}));

// @route   GET /api/teacher/quizzes/:id
// @desc    Get a specific quiz by ID
// @access  Private (Teacher only)
router.get('/quizzes/:id', validateObjectId, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacher: req.user._id
  });

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found'
    });
  }

  res.json({
    status: 'success',
    data: {
      quiz
    }
  });
}));

// @route   PUT /api/teacher/quizzes/:id
// @desc    Update a quiz
// @access  Private (Teacher only)
router.put('/quizzes/:id', validateObjectId, validateQuizUpdate, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacher: req.user._id
  });

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found'
    });
  }

  // Update quiz
  Object.assign(quiz, req.body);
  await quiz.save();

  res.json({
    status: 'success',
    message: 'Quiz updated successfully',
    data: {
      quiz
    }
  });
}));

// @route   DELETE /api/teacher/quizzes/:id
// @desc    Delete a quiz
// @access  Private (Teacher only)
router.delete('/quizzes/:id', validateObjectId, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacher: req.user._id
  });

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found'
    });
  }

  // Check if quiz has any attempts
  const attemptCount = await StudentSession.countDocuments({ quiz: quiz._id });
  if (attemptCount > 0) {
    return res.status(400).json({
      status: 'error',
      message: `Cannot delete quiz. It has ${attemptCount} student attempts.`
    });
  }

  await Quiz.findByIdAndDelete(req.params.id);

  res.json({
    status: 'success',
    message: 'Quiz deleted successfully'
  });
}));

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard statistics
// @access  Private (Teacher only)
router.get('/dashboard', asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  // Get basic statistics
  const [totalQuizzes, activeQuizzes, totalSessions, completedSessions] = await Promise.all([
    Quiz.countDocuments({ teacher: teacherId }),
    Quiz.countDocuments({ teacher: teacherId, isActive: true }),
    StudentSession.countDocuments({ quiz: { $in: await Quiz.find({ teacher: teacherId }).select('_id') } }),
    StudentSession.countDocuments({ 
      quiz: { $in: await Quiz.find({ teacher: teacherId }).select('_id') },
      status: 'completed'
    })
  ]);

  // Get recent quizzes
  const recentQuizzes = await Quiz.find({ teacher: teacherId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title shareableLink createdAt attemptsCount averageScore');

  res.json({
    status: 'success',
    data: {
      statistics: {
        totalQuizzes,
        activeQuizzes,
        totalSessions,
        completedSessions
      },
      recentQuizzes
    }
  });
}));

export default router;
