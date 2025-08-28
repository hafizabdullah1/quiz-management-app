import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { selectQuizzes } from '../store/quizSlice'

const AnalyticsDashboard = () => {
  const quizzes = useSelector(selectQuizzes)
  const router = useRouter()
  
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedQuiz, setSelectedQuiz] = useState('all')

  // Add safety check for quizzes
  const safeQuizzes = quizzes || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Testing with basic hooks
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Quizzes</option>
            {safeQuizzes.map(quiz => (
              <option key={quiz._id} value={quiz._id}>{quiz.title}</option>
            ))}
          </select>
        </div>
        
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Quizzes</h3>
            <p className="text-3xl font-bold text-blue-600">{safeQuizzes.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Active Sessions</h3>
            <p className="text-3xl font-bold text-green-600">2</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Attempts</h3>
            <p className="text-3xl font-bold text-purple-600">15</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Average Score</h3>
            <p className="text-3xl font-bold text-orange-600">78%</p>
          </div>
        </div>
        
        {/* Simple Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Analytics Content
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Now with Redux hooks and router functionality. Time range: {timeRange}, Selected quiz: {selectedQuiz}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
