import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (params, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { quizService } = await import('../services/quizService')
      const normalized = await quizService.getQuizzes(params)
      return normalized
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch quizzes')
    }
  }
)

export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { quizService } = await import('../services/quizService')
      const quiz = await quizService.createQuiz(quizData)
      return quiz
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create quiz')
    }
  }
)

export const updateQuiz = createAsyncThunk(
  'quiz/updateQuiz',
  async ({ id, quizData }, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { quizService } = await import('../services/quizService')
      const quiz = await quizService.updateQuiz(id, quizData)
      return quiz
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update quiz')
    }
  }
)

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (id, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { quizService } = await import('../services/quizService')
      await quizService.deleteQuiz(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz')
    }
  }
)

export const getQuizById = createAsyncThunk(
  'quiz/getQuizById',
  async (id, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { quizService } = await import('../services/quizService')
      const quiz = await quizService.getQuizById(id)
      return quiz
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch quiz')
    }
  }
)

export const duplicateQuiz = createAsyncThunk(
  'quiz/duplicateQuiz',
  async (id, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { quizService } = await import('../services/quizService')
      const response = await quizService.duplicateQuiz(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to duplicate quiz')
    }
  }
)

export const toggleQuizStatus = createAsyncThunk(
  'quiz/toggleQuizStatus',
  async ({ quizId, status }, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { quizService } = await import('../services/quizService')
      const response = await quizService.updateQuiz(quizId, { status })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle quiz status')
    }
  }
)

const initialState = {
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    search: '',
    status: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
}

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1 // Reset to first page when filters change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload
      state.pagination.page = 1 // Reset to first page when limit changes
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload || {}
        const quizzes = payload.quizzes || payload?.data?.quizzes || []
        const pg = payload.pagination || payload?.data?.pagination || {}
        const page = pg.page || pg.currentPage || 1
        const limit = pg.limit || pg.itemsPerPage || 10
        const total = pg.total || pg.totalItems || quizzes.length
        const totalPages = pg.totalPages || (limit ? Math.ceil(total / limit) : 1)
        const hasNext = pg.hasNext ?? (page < totalPages)
        const hasPrev = pg.hasPrev ?? (page > 1)

        state.quizzes = quizzes
        state.pagination = { page, limit, total, hasNext, hasPrev }
        state.error = null
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Quiz
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.quizzes.unshift(action.payload)
          state.pagination.total += 1
          state.currentQuiz = action.payload
        }
        state.error = null
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Quiz
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.quizzes.findIndex(quiz => quiz._id === action.payload._id)
        if (index !== -1) {
          state.quizzes[index] = action.payload
        }
        if (state.currentQuiz && state.currentQuiz._id === action.payload._id) {
          state.currentQuiz = action.payload
        }
        state.error = null
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isLoading = false
        state.quizzes = state.quizzes.filter(quiz => quiz._id !== action.payload)
        state.pagination.total -= 1
        if (state.currentQuiz && state.currentQuiz._id === action.payload) {
          state.currentQuiz = null
        }
        state.error = null
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Quiz By ID
      .addCase(getQuizById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getQuizById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentQuiz = action.payload
        state.error = null
      })
      .addCase(getQuizById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Duplicate Quiz
      .addCase(duplicateQuiz.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(duplicateQuiz.fulfilled, (state, action) => {
        state.isLoading = false
        state.quizzes.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(duplicateQuiz.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Toggle Quiz Status
      .addCase(toggleQuizStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(toggleQuizStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.quizzes.findIndex(quiz => quiz._id === action.payload._id)
        if (index !== -1) {
          state.quizzes[index] = action.payload
        }
        if (state.currentQuiz && state.currentQuiz._id === action.payload._id) {
          state.currentQuiz = action.payload
        }
        state.error = null
      })
      .addCase(toggleQuizStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { 
  clearError, 
  setCurrentQuiz, 
  clearCurrentQuiz, 
  setFilters, 
  setPage, 
  setLimit, 
  resetFilters 
} = quizSlice.actions

// Selectors
export const selectQuizzes = (state) => state.quiz.quizzes
export const selectCurrentQuiz = (state) => state.quiz.currentQuiz
export const selectQuizLoading = (state) => state.quiz.isLoading
export const selectQuizzesLoading = (state) => state.quiz.isLoading
export const selectQuizError = (state) => state.quiz.error
export const selectQuizPagination = (state) => state.quiz.pagination
export const selectQuizFilters = (state) => state.quiz.filters

export default quizSlice.reducer
