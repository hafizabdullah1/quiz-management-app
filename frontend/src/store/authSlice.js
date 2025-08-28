import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../services/authService'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken(refreshToken)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      if (!token) {
        throw new Error('No token available')
      }
      const response = await authService.getCurrentUser()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return null
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed')
    }
  }
)

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  message: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessage: (state) => {
      state.message = null
    },
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload
      state.user = user
      state.token = token
      state.refreshToken = refreshToken
      state.isAuthenticated = true
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.message = null
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle rehydration from redux-persist
      .addCase('persist/REHYDRATE', (state, action) => {
        console.log('Auth: REHYDRATE action received:', action.payload)
        if (action.payload && action.payload.auth) {
          const { user, token, refreshToken, isAuthenticated } = action.payload.auth
          console.log('Auth: Rehydrating auth state:', { 
            user: !!user, 
            token: !!token, 
            refreshToken: !!refreshToken,
            isAuthenticated: isAuthenticated
          })
          
          // If we have persisted authentication data, restore it
          if (user && token) {
            state.user = user
            state.token = token
            state.refreshToken = refreshToken
            // Use persisted isAuthenticated value if available, otherwise derive from user/token
            state.isAuthenticated = isAuthenticated !== undefined ? isAuthenticated : true
            console.log('Auth: Auth state rehydrated successfully, isAuthenticated set to:', state.isAuthenticated)
          } else {
            console.log('Auth: Rehydration failed - missing user or token')
          }
        } else {
          console.log('Auth: No auth payload in rehydration')
        }
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        // Handle both possible response structures
        if (action.payload.data) {
          // Registration-style response
          state.user = action.payload.data.user
          state.token = action.payload.data.token
          state.refreshToken = action.payload.data.refreshToken
        } else {
          // Direct login response
          state.user = action.payload.user
          state.token = action.payload.token
          state.refreshToken = action.payload.refreshToken
        }
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.data.user
        state.token = action.payload.data.token
        state.message = action.payload.message || 'Registration successful'
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.error = null
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
        state.error = null
        state.message = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.message = action.payload.message || 'Password reset email sent'
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.message = action.payload.message || 'Password reset successful'
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearMessage, setCredentials, updateUser, logout } = authSlice.actions

// Selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error
export const selectAuthMessage = (state) => state.auth.message

export default authSlice.reducer
