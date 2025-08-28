import api, { endpoints } from './api'

export const authService = {
  // User registration
  async register(userData) {
    try {
      const response = await api.post(endpoints.auth.register, userData)
      return response.data
    } catch (error) {
      // Handle validation errors properly
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.message).join(', ')
        throw new Error(validationErrors)
      }
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  // User login
  async login(credentials) {
    try {
      const response = await api.post(endpoints.auth.login, credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  // Google OAuth login
  async googleLogin(tokenId) {
    try {
      const response = await api.post(endpoints.auth.google, { tokenId })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google login failed')
    }
  },

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const response = await api.post(endpoints.auth.refresh, { refreshToken })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed')
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get(endpoints.auth.me)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user profile')
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put(endpoints.auth.me, profileData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed')
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post(endpoints.auth.forgotPassword, { email })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset request failed')
    }
  },

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await api.post(endpoints.auth.resetPassword, { token, password })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  },

  // User logout
  async logout() {
    try {
      const response = await api.post(endpoints.auth.logout)
      return response.data
    } catch (error) {
      // Don't throw error on logout, just log it
      console.warn('Logout API call failed:', error)
      return { success: true }
    }
  },

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Email verification failed')
    }
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const response = await api.post('/auth/resend-verification', { email })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification email')
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('persist:auth')
    if (!token) return false
    
    try {
      const authData = JSON.parse(token)
      const userData = JSON.parse(authData.user || '{}')
      return !!userData.token
    } catch {
      return false
    }
  },

  // Get stored token
  getStoredToken() {
    try {
      const authData = localStorage.getItem('persist:auth')
      if (!authData) return null
      
      const parsed = JSON.parse(authData)
      const userData = JSON.parse(parsed.user || '{}')
      return userData.token
    } catch {
      return null
    }
  },

  // Get stored refresh token
  getStoredRefreshToken() {
    try {
      const authData = localStorage.getItem('persist:auth')
      if (!authData) return null
      
      const parsed = JSON.parse(authData)
      const userData = JSON.parse(parsed.user || '{}')
      return userData.refreshToken
    } catch {
      return null
    }
  },

  // Clear stored auth data
  clearStoredAuth() {
    try {
      localStorage.removeItem('persist:auth')
    } catch (error) {
      console.warn('Failed to clear stored auth data:', error)
    }
  }
}

export default authService
