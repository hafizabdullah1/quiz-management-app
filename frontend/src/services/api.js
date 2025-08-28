import axios from 'axios'
import { store } from '../store'
import toast from 'react-hot-toast'

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: apiBase,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const state = store.getState()
        const refreshTokenValue = state.auth.refreshToken
        
        if (refreshTokenValue) {
          // Import dynamically to avoid circular dependency
          const { refreshToken } = await import('../store/authSlice')
          const response = await store.dispatch(refreshToken(refreshTokenValue)).unwrap()
          originalRequest.headers.Authorization = `Bearer ${response.token}`
          return api(originalRequest)
        } else {
          // Import dynamically to avoid circular dependency
          const { logout } = await import('../store/authSlice')
          store.dispatch(logout())
          return Promise.reject(error)
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (refreshError) {
        // Import dynamically to avoid circular dependency
        const { logout } = await import('../store/authSlice')
        store.dispatch(logout())
        return Promise.reject(error)
      }
    }
    
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.message) {
      toast.error(error.message)
    }
    
    return Promise.reject(error)
  }
)

export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    google: '/auth/google',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  quiz: {
    list: '/teacher/quizzes',
    create: '/teacher/quizzes',
    getById: (id) => `/teacher/quizzes/${id}`,
    update: (id) => `/teacher/quizzes/${id}`,
    delete: (id) => `/teacher/quizzes/${id}`,
    duplicate: (id) => `/teacher/quizzes/${id}/duplicate`,
    dashboard: '/teacher/dashboard',
  },
  studentQuiz: {
    getByLink: (link) => `/quiz/${link}`,
    start: (link) => `/quiz/${link}/start`,
    submit: (link) => `/quiz/${link}/submit`,
    tabShift: (link) => `/quiz/${link}/tab-shift`,
  },
  analytics: {
    quiz: (id) => `/analytics/quiz/${id}`,
    sessions: (quizId) => `/analytics/sessions/${quizId}`,
    export: (quizId) => `/analytics/export/${quizId}`,
  },
  session: {
    status: (id) => `/student/session/${id}/status`,
    update: (id) => `/student/session/${id}/update`,
  },
}

export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const createQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item))
      } else {
        searchParams.append(key, value)
      }
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export default api
