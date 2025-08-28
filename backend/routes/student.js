import express from 'express';
import StudentSession from '../models/StudentSession.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/student/session/:sessionId/status
// @desc    Get session status and basic info
// @access  Public
router.get('/session/:sessionId/status', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await StudentSession.findOne({ sessionId })
    .populate('quiz', 'title timeLimit totalPoints settings');

  if (!session) {
    return res.status(404).json({
      status: 'error',
      message: 'Session not found'
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
        blockReason: session.blockReason,
        status: session.status
      },
      quiz: {
        id: session.quiz._id,
        title: session.quiz.title,
        timeLimit: session.quiz.timeLimit,
        totalPoints: session.quiz.totalPoints,
        settings: session.quiz.settings
      }
    }
  });
}));

// @route   GET /api/student/session/:sessionId/progress
// @desc    Get student's progress in the quiz
// @access  Public
router.get('/session/:sessionId/progress', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await StudentSession.findOne({ sessionId })
    .populate('quiz', 'questions totalPoints');

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

  // Calculate progress
  const totalQuestions = session.quiz.questions.length;
  const answeredQuestions = session.answers.length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  res.json({
    status: 'success',
    data: {
      progress: {
        answeredQuestions,
        totalQuestions,
        percentage: progress,
        remainingQuestions: totalQuestions - answeredQuestions
      },
      answers: session.answers.map(answer => ({
        questionId: answer.questionId,
        submittedAt: answer.submittedAt,
        timeSpent: answer.timeSpent
      }))
    }
  });
}));

export default router;
