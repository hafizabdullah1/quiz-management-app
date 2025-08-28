import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules for user registration
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  validate
];

// Validation rules for user login
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Validation rules for quiz creation
const validateQuizCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Quiz title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Time limit must be between 1 and 300 minutes'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Quiz must have at least one question'),
  body('questions.*.question')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  body('questions.*.type')
    .isIn(['multiple-choice', 'true-farning', 'short-answer', 'essay'])
    .withMessage('Invalid question type'),
  body('questions.*.points')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points must be at least 1'),
  body('questions.*.timeLimit')
    .optional()
    .isInt({ min: 10, max: 600 })
    .withMessage('Question time limit must be between 10 and 600 seconds'),
  body('questions.*.options')
    .if(body('questions.*.type').equals('multiple-choice'))
    .isArray({ min: 2 })
    .withMessage('Multiple choice questions must have at least 2 options'),
  body('questions.*.options.*.text')
    .if(body('questions.*.type').equals('multiple-choice'))
    .trim()
    .notEmpty()
    .withMessage('Option text is required'),
  body('questions.*.options.*.isCorrect')
    .if(body('questions.*.type').equals('multiple-choice'))
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  body('questions.*.correctAnswer')
    .if(body('questions.*.type').not().equals('multiple-choice'))
    .trim()
    .notEmpty()
    .withMessage('Correct answer is required for non-multiple choice questions'),
  body('settings.tabShiftLimit')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Tab shift limit must be between 0 and 10'),
  body('settings.maxAttempts')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max attempts must be between 1 and 10'),
  validate
];

// Validation rules for quiz update
const validateQuizUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Quiz title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Time limit must be between 1 and 300 minutes'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
];

// Validation rules for student session creation
const validateStudentSession = [
  body('studentName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Student name must be between 2 and 50 characters'),
  body('studentEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('quizId')
    .isMongoId()
    .withMessage('Invalid quiz ID'),
  validate
];

// Validation rules for starting quiz sessions
const validateStartQuizSession = [
  body('studentName')
    .trim()
    .notEmpty()
    .withMessage('Student name is required'),
  body('studentEmail')
    .trim()
    .isEmail()
    .withMessage('Valid student email is required'),
  validate
];

// Validation rules for answer submission
const validateAnswerSubmission = [
  body('questionIndex')
    .isInt({ min: 0 })
    .withMessage('Question index must be a non-negative integer'),
  body('answer')
    .notEmpty()
    .withMessage('Answer is required'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number'),
  validate
];

// Validation rules for MongoDB ObjectId parameters
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

// Validation rules for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'score', 'duration'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  validate
];

// Validation rules for search
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('category')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Category must be at least 2 characters'),
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  validate
];

export {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateQuizCreation,
  validateQuizUpdate,
  validateStudentSession,
  validateStartQuizSession,
  validateAnswerSubmission,
  validateObjectId,
  validatePagination,
  validateSearch
};
