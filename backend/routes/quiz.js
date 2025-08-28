import express from 'express';
import Quiz from '../models/Quiz.js';
import StudentSession from '../models/StudentSession.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateObjectId, validateStudentSession, validateAnswerSubmission, validateStartQuizSession } from '../middleware/validation.js';
import { optionalAuth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// @route   GET /api/quiz/:shareableLink
// @desc    Get quiz by shareable link (public access)
// @access  Public
router.get('/:shareableLink', asyncHandler(async (req, res) => {
  const { shareableLink } = req.params;

  const quiz = await Quiz.findOne({ 
    shareableLink, 
    isActive: true 
  }).populate('teacher', 'name');

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found or inactive'
    });
  }

  // Check if quiz is available (scheduled time)
  if (!quiz.isAvailable()) {
    return res.status(400).json({
      status: 'error',
      message: 'Quiz is not available at this time'
    });
  }

  // Return basic quiz info for students
  res.json({
    status: 'success',
    data: {
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questionCount: quiz.questionCount,
        totalPoints: quiz.totalPoints,
        estimatedDuration: quiz.estimatedDuration,
        settings: {
          allowReview: quiz.settings.allowReview,
          randomizeQuestions: quiz.settings.randomizeQuestions,
          maxAttempts: quiz.settings.maxAttempts,
          tabShiftLimit: quiz.settings.tabShiftLimit,
          enableProctoring: quiz.settings.enableProctoring
        },
        teacher: quiz.teacher.name,
        tags: quiz.tags,
        category: quiz.category,
        difficulty: quiz.difficulty
      }
    }
  });
}));

// @route   POST /api/quiz/:shareableLink/start
// @desc    Start a new student session for a quiz
// @access  Public
router.post('/:shareableLink/start', validateStartQuizSession, asyncHandler(async (req, res) => {
  const { shareableLink } = req.params;
  const { studentName, studentEmail } = req.body;

  // Find quiz
  const quiz = await Quiz.findOne({ 
    shareableLink, 
    isActive: true 
  });

  if (!quiz) {
    return res.status(404).json({
      status: 'error',
      message: 'Quiz not found or inactive'
    });
  }

  // Check if quiz is available
  if (!quiz.isAvailable()) {
    return res.status(400).json({
      status: 'error',
      message: 'Quiz is not available at this time'
    });
  }

  // Check if student has already reached max attempts
  const existingSessions = await StudentSession.find({
    quiz: quiz._id,
    studentName,
    status: { $in: ['completed', 'abandoned', 'blocked'] }
  });

  if (existingSessions.length >= quiz.settings.maxAttempts) {
    return res.status(400).json({
      status: 'error',
      message: `You have already attempted this quiz ${existingSessions.length} times. Maximum attempts: ${quiz.settings.maxAttempts}`
    });
  }

  // Create new student session
  const session = new StudentSession({
    quiz: quiz._id,
    studentName,
    studentEmail,
    sessionId: uuidv4(),
    maxScore: quiz.totalPoints
  });

  await session.save();

  // Add activity log
  session.activityLog.push({
    action: 'quiz-started',
    timestamp: new Date(),
    details: { quizId: quiz._id, quizTitle: quiz.title }
  });

  await session.save();

  res.status(201).json({
    status: 'success',
    message: 'Quiz session started successfully',
    data: {
      sessionId: session.sessionId,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: quiz.getStudentVersion().questions,
        totalPoints: quiz.totalPoints,
        settings: {
          allowReview: quiz.settings.allowReview,
          randomizeQuestions: quiz.settings.randomizeQuestions,
          tabShiftLimit: quiz.settings.tabShiftLimit,
          enableProctoring: quiz.settings.enableProctoring
        }
      }
    }
  });
}));

// @route   GET /api/quiz/session/:sessionId
// @desc    Get quiz session details
// @access  Public
router.get('/session/:sessionId', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await StudentSession.findOne({ sessionId })
    .populate('quiz');

  if (!session) {
    return res.status(404).json({
      status: 'error',
      message: 'Session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Session is not active'
    });
  }

  res.json({
    status: 'success',
    data: {
      session: {
        id: session._id,
        sessionId: session.sessionId,
        studentName: session.studentName,
        startTime: session.startTime,
        timeRemaining: session.timeRemaining,
        tabShiftCount: session.tabShiftCount,
        warnings: session.warnings,
        isBlocked: session.isBlocked,
        blockReason: session.blockReason
      },
      quiz: {
        id: session.quiz._id,
        title: session.quiz.title,
        description: session.quiz.description,
        timeLimit: session.quiz.timeLimit,
        totalPoints: session.quiz.totalPoints,
        settings: session.quiz.settings,
        questions: session.quiz.getStudentVersion().questions
      }
    }
  });
}));

// @route   POST /api/quiz/session/:sessionId/answer
// @desc    Submit an answer for a question
// @access  Public
router.post('/session/:sessionId/answer', validateAnswerSubmission, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { questionIndex, answer, timeSpent } = req.body;

  const session = await StudentSession.findOne({ sessionId })
    .populate('quiz');

  if (!session) {
    return res.status(404).json({
      status: 'error',
      message: 'Session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Session is not active'
    });
  }

  if (session.isBlocked) {
    return res.status(400).json({
      status: 'error',
      message: 'Session is blocked',
      details: session.blockReason
    });
  }

  // Check if questionIndex is valid
  if (questionIndex < 0 || questionIndex >= session.quiz.questions.length) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid question index'
    });
  }

  // Get the question by index
  const question = session.quiz.questions[questionIndex];
  const questionId = question._id;

  // Add answer to session
  await session.addAnswer(questionId, answer, timeSpent);

  res.json({
    status: 'success',
    message: 'Answer submitted successfully',
    data: {
      sessionId: session.sessionId,
      questionIndex,
      questionId,
      submittedAt: new Date()
    }
  });
}));

// @route   POST /api/quiz/session/:sessionId/complete
// @desc    Complete the quiz session
// @access  Public
router.post('/session/:sessionId/complete', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await StudentSession.findOne({ sessionId })
    .populate('quiz');

  if (!session) {
    return res.status(404).json({
      status: 'error',
      message: 'Session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Session is not active'
    });
  }

  // Calculate final score
  let totalScore = 0;
  const quiz = session.quiz;

  for (const answer of session.answers) {
    const question = quiz.questions.find(q => q._id.toString() === answer.questionId.toString());
    if (question) {
      let isCorrect = false;
      let points = 0;

      if (question.type === 'multiple-choice') {
        // Check if selected option is correct
        const selectedOption = question.options.find(opt => opt._id.toString() === answer.answer);
        isCorrect = selectedOption && selectedOption.isCorrect;
        points = isCorrect ? question.points : 0;
      } else {
        // For other question types, check against correct answer
        isCorrect = answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        points = isCorrect ? question.points : 0;
      }

      // Update answer with correctness and points
      answer.isCorrect = isCorrect;
      answer.points = points;
      totalScore += points;
    }
  }

  // Update session
  session.score = totalScore;
  session.percentage = Math.round((totalScore / session.maxScore) * 100);
  await session.completeSession();

  // Update quiz statistics
  await quiz.updateStats(totalScore);

  res.json({
    status: 'success',
    message: 'Quiz completed successfully',
    data: {
      sessionId: session.sessionId,
      score: session.score,
      maxScore: session.maxScore,
      percentage: session.percentage,
      duration: session.duration,
      tabShiftCount: session.tabShiftCount,
      suspiciousActivity: session.suspiciousActivity,
      completedAt: session.endTime
    }
  });
}));

// @route   POST /api/quiz/session/:sessionId/abandon
// @desc    Abandon the quiz session
// @access  Public
router.post('/session/:sessionId/abandon', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body;

  const session = await StudentSession.findOne({ sessionId });

  if (!session) {
    return res.status(404).json({
      status: 'error',
      message: 'Session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Session is not active'
    });
  }

  await session.abandonSession(reason);

  res.json({
    status: 'success',
    message: 'Quiz session abandoned',
    data: {
      sessionId: session.sessionId,
      status: session.status,
      reason: session.blockReason
    }
  });
}));

// @route   POST /api/quiz/session/:sessionId/tab-shift
// @desc    Track tab shift activity
// @access  Public
router.post('/session/:sessionId/tab-shift', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { shiftCount } = req.body;

  const session = await StudentSession.findOne({ sessionId });

  if (!session) {
    return res.status(404).json({
      status: 'error',
      message: 'Session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Session is not active'
    });
  }

  // Add tab shift tracking
  await session.addTabShift('tab-hidden', 0);

  res.json({
    status: 'success',
    message: 'Tab shift tracked',
    data: {
      sessionId: session.sessionId,
      tabShiftCount: session.tabShiftCount,
      isBlocked: session.isBlocked,
      warnings: session.warnings
    }
  });
}));

export default router;
