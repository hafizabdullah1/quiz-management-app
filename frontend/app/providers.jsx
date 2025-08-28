'use client'

import React, { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'react-hot-toast'
import { store, persistor } from '../src/store'
import { ThemeProvider } from '../src/contexts/ThemeContext'

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

export default function Providers({ children }) {
  const [isClient, setIsClient] = useState(false)
  const [isStoreReady, setIsStoreReady] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Check if store is ready
    if (store) {
      setIsStoreReady(true)
      console.log('Store is ready:', { store: !!store, persistor: !!persistor })
      
      // Log initial store state
      const initialState = store.getState()
      console.log('Initial store state:', {
        auth: {
          user: !!initialState.auth.user,
          token: !!initialState.auth.token,
          isAuthenticated: initialState.auth.isAuthenticated,
          isLoading: initialState.auth.isLoading
        }
      })
    }
  }, [])

  // Show loading until client-side hydration and store are ready
  if (!isClient || !isStoreReady) {
    return <LoadingSpinner />
  }

  console.log('Providers: Rendering with store and persistor:', { store: !!store, persistor: !!persistor })

  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" toastOptions={{
              duration: 3000,
            }} />
          </ThemeProvider>
        </PersistGate>
      ) : (
        <ThemeProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
          }} />
        </ThemeProvider>
      )}
    </Provider>
  )
}
