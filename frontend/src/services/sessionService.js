import api, { endpoints } from './api'

export const sessionService = {
  // Start a new quiz session
  async startQuizSession(shareableLink, studentData) {
    try {
      const response = await api.post(endpoints.studentQuiz.start(shareableLink), studentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start quiz session')
    }
  },

  // Submit quiz session
  async submitQuizSession(shareableLink, sessionData) {
    try {
      const response = await api.post(endpoints.studentQuiz.submit(shareableLink), sessionData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit quiz session')
    }
  },

  // Report tab shift or suspicious activity
  async reportTabShift(shareableLink, tabShiftData) {
    try {
      const response = await api.post(endpoints.studentQuiz.tabShift(shareableLink), tabShiftData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to report tab shift')
    }
  },

  // Get session status
  async getSessionStatus(sessionId) {
    try {
      const response = await api.get(endpoints.session.status(sessionId))
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session status')
    }
  },

  // Update session answers
  async updateSessionAnswers(sessionId, answers) {
    try {
      const response = await api.put(endpoints.session.update(sessionId), { answers })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update session answers')
    }
  },

  // Abandon quiz session
  async abandonQuizSession(sessionId) {
    try {
      const response = await api.put(`/student/session/${sessionId}/abandon`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to abandon quiz session')
    }
  },

  // Get quiz by shareable link
  async getQuizByLink(shareableLink) {
    try {
      const response = await api.get(endpoints.studentQuiz.getByLink(shareableLink))
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz')
    }
  },

  // Validate quiz access
  async validateQuizAccess(shareableLink) {
    try {
      const response = await api.get(`/quiz/${shareableLink}/validate`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate quiz access')
    }
  },

  // Get session progress
  async getSessionProgress(sessionId) {
    try {
      const response = await api.get(`/student/session/${sessionId}/progress`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session progress')
    }
  },

  // Save session progress (auto-save)
  async saveSessionProgress(sessionId, progressData) {
    try {
      const response = await api.put(`/student/session/${sessionId}/progress`, progressData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save session progress')
    }
  },

  // Get session time remaining
  async getSessionTimeRemaining(sessionId) {
    try {
      const response = await api.get(`/student/session/${sessionId}/time`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session time')
    }
  },

  // Extend session time (if allowed)
  async extendSessionTime(sessionId, extensionData) {
    try {
      const response = await api.post(`/student/session/${sessionId}/extend`, extensionData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to extend session time')
    }
  },

  // Report technical issues
  async reportTechnicalIssue(sessionId, issueData) {
    try {
      const response = await api.post(`/student/session/${sessionId}/report-issue`, issueData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to report technical issue')
    }
  },

  // Get session instructions
  async getSessionInstructions(sessionId) {
    try {
      const response = await api.get(`/student/session/${sessionId}/instructions`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session instructions')
    }
  },

  // Acknowledge instructions
  async acknowledgeInstructions(sessionId) {
    try {
      const response = await api.post(`/student/session/${sessionId}/acknowledge-instructions`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to acknowledge instructions')
    }
  },

  // Get session summary
  async getSessionSummary(sessionId) {
    try {
      const response = await api.get(`/student/session/${sessionId}/summary`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session summary')
    }
  },

  // Request session review
  async requestSessionReview(sessionId, reviewData) {
    try {
      const response = await api.post(`/student/session/${sessionId}/request-review`, reviewData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to request session review')
    }
  },

  // Get session history for student
  async getSessionHistory(studentId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`/student/sessions/history${queryString ? `?${queryString}` : ''}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session history')
    }
  },

  // Get session analytics for student
  async getSessionAnalytics(studentId) {
    try {
      const response = await api.get(`/student/sessions/analytics`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session analytics')
    }
  },

  // Download session certificate
  async downloadSessionCertificate(sessionId) {
    try {
      const response = await api.get(`/student/session/${sessionId}/certificate`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download certificate')
    }
  },

  // Check session eligibility
  async checkSessionEligibility(shareableLink, studentData) {
    try {
      const response = await api.post(`/quiz/${shareableLink}/check-eligibility`, studentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check session eligibility')
    }
  },

  // Get session requirements
  async getSessionRequirements(shareableLink) {
    try {
      const response = await api.get(`/quiz/${shareableLink}/requirements`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session requirements')
    }
  }
}

export default sessionService
