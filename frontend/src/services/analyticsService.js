import api, { endpoints, createQueryString } from './api'

export const analyticsService = {
  // Get quiz analytics overview
  async getQuizAnalytics(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`${endpoints.analytics.quiz(quizId)}${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz analytics')
    }
  },

  // Get session analytics
  async getSessionAnalytics(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`${endpoints.analytics.sessions(quizId)}${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch session analytics')
    }
  },

  // Export analytics data
  async exportAnalytics(quizId, format = 'csv', params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`${endpoints.analytics.export(quizId)}`, {
        params: { format, ...params },
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export analytics')
    }
  },

  // Get performance metrics
  async getPerformanceMetrics(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/performance${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch performance metrics')
    }
  },

  // Get question analysis
  async getQuestionAnalysis(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/questions${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch question analysis')
    }
  },

  // Get student performance comparison
  async getStudentPerformanceComparison(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/student-comparison${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student performance comparison')
    }
  },

  // Get time analysis
  async getTimeAnalysis(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/time-analysis${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch time analysis')
    }
  },

  // Get cheating detection analytics
  async getCheatingDetectionAnalytics(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/cheating-detection${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cheating detection analytics')
    }
  },

  // Get geographic analytics
  async getGeographicAnalytics(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/geographic${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch geographic analytics')
    }
  },

  // Get device analytics
  async getDeviceAnalytics(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/devices${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch device analytics')
    }
  },

  // Get browser analytics
  async getBrowserAnalytics(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/browsers${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch browser analytics')
    }
  },

  // Get trend analysis
  async getTrendAnalysis(quizId, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/quiz/${quizId}/trends${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trend analysis')
    }
  },

  // Get comparative analytics
  async getComparativeAnalytics(quizIds, params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.post(`/analytics/comparative${queryString}`, { quizIds })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comparative analytics')
    }
  },

  // Get real-time analytics
  async getRealTimeAnalytics(quizId) {
    try {
      const response = await api.get(`/analytics/quiz/${quizId}/real-time`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch real-time analytics')
    }
  },

  // Get custom report
  async getCustomReport(quizId, reportConfig) {
    try {
      const response = await api.post(`/analytics/quiz/${quizId}/custom-report`, reportConfig)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate custom report')
    }
  },

  // Save report configuration
  async saveReportConfiguration(quizId, reportConfig) {
    try {
      const response = await api.post(`/analytics/quiz/${quizId}/report-config`, reportConfig)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save report configuration')
    }
  },

  // Get saved report configurations
  async getSavedReportConfigurations(quizId) {
    try {
      const response = await api.get(`/analytics/quiz/${quizId}/report-configs`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch saved report configurations')
    }
  },

  // Schedule automated reports
  async scheduleAutomatedReport(quizId, scheduleConfig) {
    try {
      const response = await api.post(`/analytics/quiz/${quizId}/schedule-report`, scheduleConfig)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to schedule automated report')
    }
  },

  // Get scheduled reports
  async getScheduledReports(quizId) {
    try {
      const response = await api.get(`/analytics/quiz/${quizId}/scheduled-reports`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scheduled reports')
    }
  },

  // Cancel scheduled report
  async cancelScheduledReport(reportId) {
    try {
      const response = await api.delete(`/analytics/scheduled-reports/${reportId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel scheduled report')
    }
  },

  // Get analytics dashboard overview
  async getAnalyticsDashboard() {
    try {
      const response = await api.get('/analytics/dashboard')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics dashboard')
    }
  },

  // Get system-wide analytics
  async getSystemWideAnalytics(params = {}) {
    try {
      const queryString = createQueryString(params)
      const response = await api.get(`/analytics/system${queryString}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system-wide analytics')
    }
  }
}

export default analyticsService
