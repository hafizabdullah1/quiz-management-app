import React from 'react'
import { motion } from 'framer-motion'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-error-600 dark:text-error-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn-primary flex-1 sm:flex-none"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="btn-secondary flex-1 sm:flex-none"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go Home
              </button>
            </div>

            {/* Support Contact */}
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>
                Need help? Contact our support team at{' '}
                <a
                  href="mailto:support@quizapp.com"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  support@quizapp.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
