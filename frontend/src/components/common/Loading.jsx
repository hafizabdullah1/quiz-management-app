import React from 'react'
import { motion } from 'framer-motion'

const Loading = ({ 
  size = 'md', 
  variant = 'spinner', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const renderSpinner = () => (
    <div className={`spinner ${sizeClasses[size]} ${className}`} />
  )

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 bg-primary-600 rounded-full ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-3 h-3 bg-primary-600 rounded-full ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )

  const renderBars = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`w-1 bg-primary-600 ${sizeClasses[size]}`}
          animate={{
            scaleY: [1, 2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'bars':
        return renderBars()
      case 'spinner':
      default:
        return renderSpinner()
    }
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          {renderContent()}
          {text && (
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {renderContent()}
      {text && (
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          {text}
        </p>
      )}
    </div>
  )
}

export default Loading
