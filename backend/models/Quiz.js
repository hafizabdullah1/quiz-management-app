import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    required: [true, 'Question type is required']
  },
  options: [{
    text: {
      type: String,
      required: function() { return this.type === 'multiple-choice'; }
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String,
    required: function() { 
      return this.type === 'true-false' || this.type === 'short-answer' || this.type === 'essay';
    }
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1']
  },
  timeLimit: {
    type: Number, // in seconds
    default: null
  },
  explanation: {
    type: String,
    default: ''
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  questions: [questionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number, // in minutes
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareableLink: {
    type: String,
    unique: true,
    sparse: true
  },
  settings: {
    allowReview: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: false
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    maxAttempts: {
      type: Number,
      default: 1
    },
    tabShiftLimit: {
      type: Number,
      default: 3
    },
    enableProctoring: {
      type: Boolean,
      default: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  scheduledStart: Date,
  scheduledEnd: Date,
  attemptsCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSchema.index({ teacher: 1, createdAt: -1 });
quizSchema.index({ shareableLink: 1 });
quizSchema.index({ isActive: 1, isPublic: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ category: 1 });

// Generate shareable link before saving
quizSchema.pre('save', function(next) {
  if (!this.shareableLink) {
    this.shareableLink = uuidv4();
  }
  
  // Calculate total points
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  
  next();
});

// Virtual for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Virtual for estimated duration
quizSchema.virtual('estimatedDuration').get(function() {
  if (this.timeLimit) return this.timeLimit;
  
  if (this.questions && this.questions.length > 0) {
    const totalQuestionTime = this.questions.reduce((total, question) => {
      return total + (question.timeLimit || 60); // default 60 seconds per question
    }, 0);
    return Math.ceil(totalQuestionTime / 60); // convert to minutes
  }
  
  return 30; // default 30 minutes
});

// Method to check if quiz is available
quizSchema.methods.isAvailable = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.scheduledStart && now < this.scheduledStart) return false;
  if (this.scheduledEnd && now > this.scheduledEnd) return false;
  
  return true;
};

// Method to get quiz for students (without correct answers)
quizSchema.methods.getStudentVersion = function() {
  const quiz = this.toObject();
  
  // Remove correct answers and explanations
  quiz.questions = quiz.questions.map(question => {
    const studentQuestion = { ...question };
    if (question.type === 'multiple-choice') {
      studentQuestion.options = question.options.map(option => ({
        text: option.text,
        id: option._id
      }));
    } else {
      delete studentQuestion.correctAnswer;
    }
    delete studentQuestion.explanation;
    return studentQuestion;
  });
  
  return quiz;
};

// Method to update statistics
quizSchema.methods.updateStats = function(score) {
  this.attemptsCount += 1;
  
  // Update average score
  const totalScore = this.averageScore * (this.attemptsCount - 1) + score;
  this.averageScore = totalScore / this.attemptsCount;
  
  return this.save();
};

// Ensure virtual fields are serialized
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

export default mongoose.model('Quiz', quizSchema);
