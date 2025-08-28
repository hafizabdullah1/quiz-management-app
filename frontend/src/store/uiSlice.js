import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  modals: {
    createQuiz: false,
    editQuiz: false,
    deleteQuiz: false,
    quizPreview: false,
    sessionDetails: false,
    exportData: false,
    settings: false
  },
  toast: {
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 4000
  },
  loadingStates: {
    global: false,
    auth: false,
    quiz: false,
    session: false
  },
  breadcrumbs: [],
  pageTitle: '',
  searchQuery: '',
  filters: {
    dateRange: 'all',
    status: 'all',
    category: 'all'
  },
  sortOptions: {
    field: 'createdAt',
    direction: 'desc'
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      }
      state.notifications.unshift(notification)
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action) => {
      const modalName = action.payload
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false
      })
    },
    showToast: (state, action) => {
      state.toast = {
        show: true,
        message: action.payload.message || '',
        type: action.payload.type || 'info',
        duration: action.payload.duration || 4000
      }
    },
    hideToast: (state) => {
      state.toast.show = false
    },
    setLoadingState: (state, action) => {
      const { key, loading } = action.payload
      if (state.loadingStates.hasOwnProperty(key)) {
        state.loadingStates[key] = loading
      }
    },
    setGlobalLoading: (state, action) => {
      state.loadingStates.global = action.payload
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setSortOptions: (state, action) => {
      state.sortOptions = { ...state.sortOptions, ...action.payload }
    },
    resetSortOptions: (state) => {
      state.sortOptions = initialState.sortOptions
    },
    resetUI: (state) => {
      return { ...initialState, theme: state.theme }
    }
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  openModal,
  closeModal,
  closeAllModals,
  showToast,
  hideToast,
  setLoadingState,
  setGlobalLoading,
  setBreadcrumbs,
  setPageTitle,
  setSearchQuery,
  setFilters,
  resetFilters,
  setSortOptions,
  resetSortOptions,
  resetUI
} = uiSlice.actions

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectTheme = (state) => state.ui.theme
export const selectNotifications = (state) => state.ui.notifications
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read)
export const selectModals = (state) => state.ui.modals
export const selectModalOpen = (modalName) => (state) => state.ui.modals[modalName]
export const selectToast = (state) => state.ui.toast
export const selectLoadingStates = (state) => state.ui.loadingStates
export const selectGlobalLoading = (state) => state.ui.loadingStates.global
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs
export const selectPageTitle = (state) => state.ui.pageTitle
export const selectSearchQuery = (state) => state.ui.searchQuery
export const selectFilters = (state) => state.ui.filters
export const selectSortOptions = (state) => state.ui.sortOptions

export default uiSlice.reducer
