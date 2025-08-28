import api, { endpoints, createQueryString } from './api'

export const quizService = {
  // Get all quizzes with pagination and filters
  async getQuizzes(params = {}) {
    try {
      const queryString = createQueryString({ ...params, _: Date.now() })
      const response = await api.get(`${endpoints.quiz.list}${queryString}`, {
        headers: { 'Cache-Control': 'no-cache' },
      })
      const envelope = response.data?.data || response.data
      // Normalize to { quizzes, pagination }
      const quizzes = envelope?.quizzes || envelope?.data?.quizzes || []
      const pagination = envelope?.pagination || envelope?.data?.pagination || {}
      return { quizzes, pagination }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quizzes')
    }
  },

  // Get quiz by ID
  async getQuizById(id) {
    try {
      const response = await api.get(endpoints.quiz.getById(id))
      const quiz = response.data?.data?.quiz || response.data?.quiz || response.data
      return quiz
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz')
    }
  },

  // Create new quiz
  async createQuiz(quizData) {
    try {
      const response = await api.post(endpoints.quiz.create, quizData)
      // Backend returns { status, message, data: { quiz: { id, ... } } }
      const serverQuiz = response.data?.data?.quiz || response.data?.quiz || response.data
      if (serverQuiz && serverQuiz.id) {
        const { id, ...rest } = serverQuiz
        return { ...rest, _id: id }
      }
      return serverQuiz
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create quiz')
    }
  },

  // Update quiz
  async updateQuiz(id, quizData) {
    try {
      const response = await api.put(endpoints.quiz.update(id), quizData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update quiz')
    }
  },

  // Delete quiz
  async deleteQuiz(id) {
    try {
      const response = await api.delete(endpoints.quiz.delete(id))
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete quiz')
    }
  },

  // Duplicate quiz
  async duplicateQuiz(id) {
    try {
      const response = await api.post(endpoints.quiz.duplicate(id))
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to duplicate quiz')
    }
  },

  // Get quiz dashboard data
  async getQuizDashboard() {
    try {
      const response = await api.get(endpoints.quiz.dashboard)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  },

  // Get quiz statistics
  async getQuizStats(quizId) {
    try {
      const response = await api.get(`/teacher/quizzes/${quizId}/stats`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz statistics')
    }
  },

  // Get quiz sessions
  async getQuizSessions(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/teacher/quizzes/${quizId}/sessions${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz sessions')
    }
  },

  // Export quiz results
  async exportQuizResults(quizId, format = 'csv') {
    try {
      const response = await api.get(`/teacher/quizzes/${quizId}/export`, {
        params: { format },
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export quiz results')
    }
  },

  // Publish quiz
  async publishQuiz(id) {
    try {
      const response = await api.put(`/teacher/quizzes/${id}/publish`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish quiz')
    }
  },

  // Unpublish quiz
  async unpublishQuiz(id) {
    try {
      const response = await api.put(`/teacher/quizzes/${id}/unpublish`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unpublish quiz')
    }
  },

  // Archive quiz
  async archiveQuiz(id) {
    try {
      const response = await api.put(`/teacher/quizzes/${id}/archive`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to archive quiz')
    }
  },

  // Restore archived quiz
  async restoreQuiz(id) {
    try {
      const response = await api.put(`/teacher/quizzes/${id}/restore`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to restore quiz')
    }
  },

  // Get quiz templates
  async getQuizTemplates() {
    try {
      const response = await api.get('/teacher/quiz-templates')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz templates')
    }
  },

  // Create quiz from template
  async createFromTemplate(templateId, quizData) {
    try {
      const response = await api.post(`/teacher/quiz-templates/${templateId}/create`, quizData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create quiz from template')
    }
  },

  // Share quiz
  async shareQuiz(id, shareData) {
    try {
      const response = await api.post(`/teacher/quizzes/${id}/share`, shareData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to share quiz')
    }
  },

  // Get quiz sharing settings
  async getQuizSharingSettings(id) {
    try {
      const response = await api.get(`/teacher/quizzes/${id}/sharing`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sharing settings')
    }
  },

  // Update quiz sharing settings
  async updateQuizSharingSettings(id, sharingData) {
    try {
      const response = await api.put(`/teacher/quizzes/${id}/sharing`, sharingData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update sharing settings')
    }
  },

  // Get quiz access logs
  async getQuizAccessLogs(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/teacher/quizzes/${quizId}/access-logs${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch access logs')
    }
  },

  // Bulk operations
  async bulkDeleteQuizzes(ids) {
    try {
      const response = await api.post('/teacher/quizzes/bulk-delete', { ids })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete quizzes')
    }
  },

  async bulkPublishQuizzes(ids) {
    try {
      const response = await api.post('/teacher/quizzes/bulk-publish', { ids })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish quizzes')
    }
  },

  async bulkArchiveQuizzes(ids) {
    try {
      const response = await api.post('/teacher/quizzes/bulk-archive', { ids })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to archive quizzes')
    }
  },

  // Submit answer
  async submitAnswer(sessionId, questionIndex, answer) {
    try {
      const response = await api.post(`/quiz/session/${sessionId}/answer`, {
        questionIndex,
        answer
      })
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit answer')
    }
  },

  // ===== STUDENT QUIZ FUNCTIONS =====

  // Get quiz by shareable link (public)
  async getQuizByShareableLink(shareableLink) {
    try {
      const response = await api.get(`/quiz/${shareableLink}`)
      return response.data.data.quiz
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz')
    }
  },

  // Start quiz session
  async startQuizSession(shareableLink, studentData) {
    try {
      const response = await api.post(`/quiz/${shareableLink}/start`, studentData)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start quiz session')
    }
  },

  // Get session details
  async getSessionDetails(sessionId) {
    try {
      const response = await api.get(`/quiz/session/${sessionId}`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch session details')
    }
  },

  // Complete quiz session
  async completeQuizSession(sessionId) {
    try {
      const response = await api.post(`/quiz/session/${sessionId}/complete`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete quiz session')
    }
  },

  // Abandon quiz session
  async abandonQuizSession(sessionId) {
    try {
      const response = await api.post(`/quiz/session/${sessionId}/abandon`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to abandon quiz session')
    }
  },

  // Track tab shift
  async trackTabShift(sessionId, shiftCount) {
    try {
      const response = await api.post(`/quiz/session/${sessionId}/tab-shift`, {
        shiftCount
      })
      return response.data.data
    } catch (error) {
      // Don't throw error for tab shift tracking as it's not critical
      console.warn('Failed to track tab shift:', error)
      return null
    }
  }
}
