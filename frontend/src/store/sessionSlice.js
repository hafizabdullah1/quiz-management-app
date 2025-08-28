import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sessionService } from '../services/sessionService'

// Async thunks
export const startQuizSession = createAsyncThunk(
  'session/startQuizSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await sessionService.startSession(sessionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start session')
    }
  }
)

export const submitQuizSession = createAsyncThunk(
  'session/submitQuizSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await sessionService.submitSession(sessionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit session')
    }
  }
)

export const abandonQuizSession = createAsyncThunk(
  'session/abandonQuizSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await sessionService.abandonSession(sessionId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to abandon session')
    }
  }
)

export const getSessionStatus = createAsyncThunk(
  'session/getSessionStatus',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await sessionService.getSessionStatus(sessionId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get session status')
    }
  }
)

export const updateSessionAnswers = createAsyncThunk(
  'session/updateSessionAnswers',
  async ({ sessionId, answers }, { rejectWithValue }) => {
    try {
      const response = await sessionService.updateAnswers(sessionId, answers)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update answers')
    }
  }
)

export const reportTabShift = createAsyncThunk(
  'session/reportTabShift',
  async ({ sessionId, tabShiftData }, { rejectWithValue }) => {
    try {
      const response = await sessionService.reportTabShift(sessionId, tabShiftData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report tab shift')
    }
  }
)

const initialState = {
  currentSession: null,
  isActive: false,
  answers: [],
  timeRemaining: 0,
  tabShifts: [],
  isLoading: false,
  error: null,
  sessionHistory: [],
  sessionStats: {
    totalSessions: 0,
    completedSessions: 0,
    abandonedSessions: 0,
    averageScore: 0,
    averageTime: 0
  }
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload
    },
    updateAnswer: (state, action) => {
      const { questionId, answer, timeSpent } = action.payload
      const existingIndex = state.answers.findIndex(a => a.questionId === questionId)
      
      if (existingIndex !== -1) {
        state.answers[existingIndex] = { questionId, answer, timeSpent }
      } else {
        state.answers.push({ questionId, answer, timeSpent })
      }
    },
    addTabShift: (state, action) => {
      state.tabShifts.push({
        ...action.payload,
        timestamp: new Date().toISOString()
      })
    },
    clearSession: (state) => {
      state.currentSession = null
      state.isActive = false
      state.answers = []
      state.timeRemaining = 0
      state.tabShifts = []
      state.error = null
    },
    setSessionActive: (state, action) => {
      state.isActive = action.payload
    },
    updateSessionProgress: (state, action) => {
      const { currentQuestion, totalQuestions } = action.payload
      if (state.currentSession) {
        state.currentSession.currentQuestion = currentQuestion
        state.currentSession.totalQuestions = totalQuestions
        state.currentSession.progress = (currentQuestion / totalQuestions) * 100
      }
    },
    addSessionToHistory: (state, action) => {
      state.sessionHistory.unshift(action.payload)
      if (state.sessionHistory.length > 50) {
        state.sessionHistory = state.sessionHistory.slice(0, 50)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Start Quiz Session
      .addCase(startQuizSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(startQuizSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSession = action.payload
        state.isActive = true
        state.timeRemaining = action.payload.timeLimit * 60 // Convert to seconds
        state.answers = []
        state.tabShifts = []
        state.error = null
      })
      .addCase(startQuizSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Submit Quiz Session
      .addCase(submitQuizSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(submitQuizSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSession = action.payload
        state.isActive = false
        state.addSessionToHistory(action.payload)
        state.error = null
      })
      .addCase(submitQuizSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Abandon Quiz Session
      .addCase(abandonQuizSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(abandonQuizSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSession = action.payload
        state.isActive = false
        state.addSessionToHistory(action.payload)
        state.error = null
      })
      .addCase(abandonQuizSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Session Status
      .addCase(getSessionStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getSessionStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSession = action.payload
        state.isActive = action.payload.status === 'active'
        state.timeRemaining = action.payload.timeRemaining || 0
        state.answers = action.payload.answers || []
        state.tabShifts = action.payload.tabShifts || []
        state.error = null
      })
      .addCase(getSessionStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Session Answers
      .addCase(updateSessionAnswers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSessionAnswers.fulfilled, (state, action) => {
        state.isLoading = false
        state.answers = action.payload.answers
        state.error = null
      })
      .addCase(updateSessionAnswers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Report Tab Shift
      .addCase(reportTabShift.pending, (state) => {
        // Don't set loading for tab shift reports
      })
      .addCase(reportTabShift.fulfilled, (state, action) => {
        // Tab shift reported successfully
        state.error = null
      })
      .addCase(reportTabShift.rejected, (state, action) => {
        // Don't set error for tab shift reports, just log it
        console.error('Failed to report tab shift:', action.payload)
      })
  },
})

export const { 
  clearError, 
  setTimeRemaining, 
  updateAnswer, 
  addTabShift, 
  clearSession, 
  setSessionActive,
  updateSessionProgress,
  addSessionToHistory
} = sessionSlice.actions

// Selectors
export const selectCurrentSession = (state) => state.session.currentSession
export const selectSessionActive = (state) => state.session.isActive
export const selectSessionAnswers = (state) => state.session.answers
export const selectTimeRemaining = (state) => state.session.timeRemaining
export const selectTabShifts = (state) => state.session.tabShifts
export const selectSessionLoading = (state) => state.session.isLoading
export const selectSessionError = (state) => state.session.error
export const selectSessionHistory = (state) => state.session.sessionHistory
export const selectSessionStats = (state) => state.session.sessionStats

export default sessionSlice.reducer
