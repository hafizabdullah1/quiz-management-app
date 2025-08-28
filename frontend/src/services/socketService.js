import { io } from 'socket.io-client'
import { store } from '../store'
import { addTabShift, updateSessionProgress } from '../store/sessionSlice'
import toast from 'react-hot-toast'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.eventHandlers = new Map()
  }

  // Initialize socket connection
  connect(token = null) {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    try {
      // Get token from store if not provided
      if (!token) {
        const state = store.getState()
        token = state.auth.token
      }

      if (!token) {
        console.warn('No authentication token available for socket connection')
        return null
      }

      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

      // Create socket connection
      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectAttempts,
        forceNew: true
      })

      this.setupEventHandlers()
      return this.socket
    } catch (error) {
      console.error('Failed to create socket connection:', error)
      return null
    }
  }

  // Setup socket event handlers
  setupEventHandlers() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
      toast.success('Real-time connection established')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.isConnected = false
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => {
          this.socket.connect()
        }, this.reconnectDelay * this.reconnectAttempts)
      } else {
        toast.error('Failed to establish real-time connection')
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      this.isConnected = true
      this.reconnectAttempts = 0
      toast.success('Real-time connection restored')
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed')
      toast.error('Real-time connection failed')
    })

    // Quiz session events
    this.socket.on('session_started', (data) => {
      console.log('Session started:', data)
      store.dispatch(updateSessionProgress({ sessionId: data.sessionId, status: 'active' }))
    })

    this.socket.on('session_ended', (data) => {
      console.log('Session ended:', data)
      store.dispatch(updateSessionProgress({ sessionId: data.sessionId, status: 'completed' }))
    })

    this.socket.on('tab_shift_detected', (data) => {
      console.log('Tab shift detected:', data)
      store.dispatch(addTabShift({
        sessionId: data.sessionId,
        timestamp: new Date().toISOString(),
        type: 'tab_shift',
        details: data.details
      }))
      
      // Show warning to student
      if (data.severity === 'high') {
        toast.error('Multiple tab switches detected. This may be flagged as suspicious activity.')
      } else {
        toast.warning('Tab switch detected. Please stay on the quiz page.')
      }
    })

    this.socket.on('time_warning', (data) => {
      console.log('Time warning:', data)
      const minutesLeft = Math.ceil(data.timeRemaining / 60)
      
      if (minutesLeft <= 5) {
        toast.error(`⚠️ Only ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} remaining!`)
      } else {
        toast.warning(`⏰ ${minutesLeft} minutes remaining`)
      }
    })

    this.socket.on('session_timeout', (data) => {
      console.log('Session timeout:', data)
      store.dispatch(updateSessionProgress({ sessionId: data.sessionId, status: 'timeout' }))
      toast.error('Session timed out. Your quiz has been automatically submitted.')
    })

    // Teacher dashboard events
    this.socket.on('student_joined', (data) => {
      console.log('Student joined:', data)
      toast.success(`${data.studentName} joined the quiz`)
    })

    this.socket.on('student_left', (data) => {
      console.log('Student left:', data)
      toast.info(`${data.studentName} left the quiz`)
    })

    this.socket.on('answer_submitted', (data) => {
      console.log('Answer submitted:', data)
      // Update real-time progress in teacher dashboard
    })

    this.socket.on('suspicious_activity', (data) => {
      console.log('Suspicious activity detected:', data)
      toast.error(`🚨 Suspicious activity detected: ${data.description}`)
    })

    // System events
    this.socket.on('maintenance_notice', (data) => {
      console.log('Maintenance notice:', data)
      toast.info(`🔧 ${data.message}`)
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error('Real-time connection error occurred')
    })
  }

  // Join quiz session room
  joinQuizSession(sessionId, quizId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected')
      return false
    }

    try {
      this.socket.emit('join_session', { sessionId, quizId })
      console.log('Joined quiz session room:', sessionId)
      return true
    } catch (error) {
      console.error('Failed to join session room:', error)
      return false
    }
  }

  // Leave quiz session room
  leaveQuizSession(sessionId) {
    if (!this.socket || !this.isConnected) {
      return false
    }

    try {
      this.socket.emit('leave_session', { sessionId })
      console.log('Left quiz session room:', sessionId)
      return true
    } catch (error) {
      console.error('Failed to leave session room:', error)
      return false
    }
  }

  // Join teacher dashboard room
  joinTeacherDashboard(teacherId) {
    if (!this.socket || !this.isConnected) {
      return false
    }

    try {
      this.socket.emit('join_teacher_dashboard', { teacherId })
      console.log('Joined teacher dashboard room:', teacherId)
      return true
    } catch (error) {
      console.error('Failed to join teacher dashboard:', error)
      return false
    }
  }

  // Leave teacher dashboard room
  leaveTeacherDashboard(teacherId) {
    if (!this.socket || !this.isConnected) {
      return false
    }

    try {
      this.socket.emit('leave_teacher_dashboard', { teacherId })
      console.log('Left teacher dashboard room:', teacherId)
      return true
    } catch (error) {
      console.error('Failed to leave teacher dashboard:', error)
      return false
    }
  }

  // Send heartbeat to keep connection alive
  sendHeartbeat() {
    if (!this.socket || !this.isConnected) {
      return false
    }

    try {
      this.socket.emit('heartbeat', { timestamp: Date.now() })
      return true
    } catch (error) {
      console.error('Failed to send heartbeat:', error)
      return false
    }
  }

  // Report tab shift
  reportTabShift(sessionId, tabShiftData) {
    if (!this.socket || !this.isConnected) {
      return false
    }

    try {
      this.socket.emit('report_tab_shift', {
        sessionId,
        ...tabShiftData,
        timestamp: Date.now()
      })
      return true
    } catch (error) {
      console.error('Failed to report tab shift:', error)
      return false
    }
  }

  // Update session progress
  updateSessionProgress(sessionId, progressData) {
    if (!this.socket || !this.isConnected) {
      return false
    }

    try {
      this.socket.emit('update_progress', {
        sessionId,
        ...progressData,
        timestamp: Date.now()
      })
      return true
    } catch (error) {
      console.error('Failed to update session progress:', error)
      return false
    }
  }

  // Add custom event handler
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(handler)
    
    if (this.socket) {
      this.socket.on(event, handler)
    }
  }

  // Remove custom event handler
  off(event, handler) {
    if (this.socket) {
      this.socket.off(event, handler)
    }
    
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.eventHandlers.clear()
      console.log('Socket disconnected')
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  // Force reconnection
  reconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket.connect()
    }
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService
