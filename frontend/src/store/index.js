import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'

import authReducer from './authSlice'
import quizReducer from './quizSlice'
import sessionReducer from './sessionSlice'
import uiReducer from './uiSlice'

// Create noop storage for server-side or when localStorage is unavailable
const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
})

// Initialize storage synchronously
let storage
if (typeof window !== 'undefined') {
  // Client-side: try to use localStorage
  try {
    // Test if localStorage is available
    const testKey = '__test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    
    // Use a simple approach that works with ES modules
    storage = {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
    }
  } catch (e) {
    console.warn('localStorage not available, using noop storage', e)
    storage = createNoopStorage()
  }
} else {
  // Server-side: use noop storage
  storage = createNoopStorage()
}

// Ensure storage is always defined
if (!storage) {
  storage = createNoopStorage()
}

// Persist configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated'], // Include isAuthenticated
}

// Persist configuration for UI
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme'], // Only persist theme preference
}

// Always use persistence for client-side, but handle SSR gracefully
const rootReducer = {
  auth: persistReducer(authPersistConfig, authReducer),
  quiz: quizReducer,
  session: sessionReducer,
  ui: persistReducer(uiPersistConfig, uiReducer),
}

// Create store with error handling
let store
try {
  console.log('Store: Creating Redux store...')
  store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  })
  console.log('Store: Redux store created successfully')
} catch (error) {
  console.error('Store: Failed to create Redux store:', error)
  // Fallback to a basic store without persistence
  store = configureStore({
    reducer: {
      auth: authReducer,
      quiz: quizReducer,
      session: sessionReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  })
  console.log('Store: Fallback store created')
}

// Only create persistor on client side
let persistor = null
if (typeof window !== 'undefined' && store) {
  try {
    console.log('Store: Creating persistor...')
    persistor = persistStore(store)
    console.log('Store: Persistor created successfully')
  } catch (error) {
    console.error('Store: Failed to create persistor:', error)
    persistor = null
  }
}

console.log('Store: Final store state:', { store: !!store, persistor: !!persistor })

export { store, persistor }

// Note: TypeScript types removed for JavaScript compatibility
// Use JSDoc comments if type information is needed
