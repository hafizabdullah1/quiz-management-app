import mongoose from 'mongoose';

const tabShiftSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  event: {
    type: String,
    enum: ['tab-hidden', 'tab-visible', 'window-blur', 'window-focus'],
    required: true
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  }
});

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const studentSessionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [50, 'Student name cannot exceed 50 characters']
  },
  studentEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  sessionId: {
    type: String,
    unique: true,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'blocked'],
    default: 'active'
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  tabShifts: [tabShiftSchema],
  tabShiftCount: {
    type: Number,
    default: 0
  },
  suspiciousActivity: {
    type: Boolean,
    default: false
  },
  activityLog: [{
    action: {
      type: String,
      enum: ['quiz-started', 'question-answered', 'tab-shift', 'quiz-completed', 'quiz-abandoned'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }],
  ipAddress: String,
  userAgent: String,
  deviceInfo: {
    type: mongoose.Schema.Types.Mixed
  },
  warnings: [{
    type: {
      type: String,
      enum: ['tab-shift', 'time-warning', 'suspicious-activity'],
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: String,
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
studentSessionSchema.index({ quiz: 1, createdAt: -1 });
studentSessionSchema.index({ sessionId: 1 });
studentSessionSchema.index({ studentName: 1 });
studentSessionSchema.index({ status: 1 });
studentSessionSchema.index({ suspiciousActivity: 1 });

// Calculate score and percentage before saving
studentSessionSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.score = this.answers.reduce((total, answer) => total + answer.points, 0);
    this.percentage = Math.round((this.score / this.maxScore) * 100);
  }
  
  // Calculate duration if session ended
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  }
  
  // Check for suspicious activity
  if (this.tabShiftCount > 0) {
    const quiz = this.constructor.model('Quiz').findById(this.quiz);
    if (quiz && quiz.settings && quiz.settings.tabShiftLimit && this.tabShiftCount > quiz.settings.tabShiftLimit) {
      this.suspiciousActivity = true;
      this.isBlocked = true;
      this.blockReason = 'Exceeded tab shift limit';
      this.status = 'blocked';
    }
  }
  
  next();
});

// Method to add tab shift
studentSessionSchema.methods.addTabShift = function(event, duration = 0) {
  this.tabShifts.push({
    timestamp: new Date(),
    event,
    duration
  });
  
  this.tabShiftCount += 1;
  
  // Add to activity log
  this.activityLog.push({
    action: 'tab-shift',
    timestamp: new Date(),
    details: { event, count: this.tabShiftCount }
  });
  
  // Add warning if threshold exceeded
  if (this.tabShiftCount > 2) {
    this.warnings.push({
      type: 'tab-shift',
      message: `Tab shift detected! This is your ${this.tabShiftCount}rd shift.`,
      timestamp: new Date()
    });
  }
  
  return this.save();
};

// Method to add answer
studentSessionSchema.methods.addAnswer = function(questionId, answer, timeSpent = 0) {
  // Check if answer already exists
  const existingAnswerIndex = this.answers.findIndex(a => a.questionId.toString() === questionId.toString());
  
  if (existingAnswerIndex !== -1) {
    // Update existing answer
    this.answers[existingAnswerIndex].answer = answer;
    this.answers[existingAnswerIndex].timeSpent = timeSpent;
    this.answers[existingAnswerIndex].submittedAt = new Date();
  } else {
    // Add new answer
    this.answers.push({
      questionId,
      answer,
      timeSpent,
      submittedAt: new Date()
    });
  }
  
  // Add to activity log
  this.activityLog.push({
    action: 'question-answered',
    timestamp: new Date(),
    details: { questionId, timeSpent }
  });
  
  return this.save();
};

// Method to complete session
studentSessionSchema.methods.completeSession = function() {
  this.endTime = new Date();
  this.status = 'completed';
  
  // Add to activity log
  this.activityLog.push({
    action: 'quiz-completed',
    timestamp: new Date(),
    details: { score: this.score, percentage: this.percentage }
  });
  
  return this.save();
};

// Method to abandon session
studentSessionSchema.methods.abandonSession = function(reason = 'Student abandoned quiz') {
  this.endTime = new Date();
  this.status = 'abandoned';
  this.blockReason = reason;
  
  // Add to activity log
  this.activityLog.push({
    action: 'quiz-abandoned',
    timestamp: new Date(),
    details: { reason }
  });
  
  return this.save();
};

// Method to add warning
studentSessionSchema.methods.addWarning = function(type, message) {
  this.warnings.push({
    type,
    message,
    timestamp: new Date()
  });
  
  return this.save();
};

// Virtual for time remaining
studentSessionSchema.virtual('timeRemaining').get(function() {
  if (!this.quiz || !this.startTime) return 0;
  
  const quiz = this.constructor.model('Quiz').findById(this.quiz);
  if (!quiz || !quiz.timeLimit) return 0;
  
  const elapsed = (Date.now() - this.startTime) / 1000 / 60; // in minutes
  return Math.max(0, quiz.timeLimit - elapsed);
});

// Ensure virtual fields are serialized
studentSessionSchema.set('toJSON', { virtuals: true });
studentSessionSchema.set('toObject', { virtuals: true });

export default mongoose.model('StudentSession', studentSessionSchema);
