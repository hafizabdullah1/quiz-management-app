import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  ClockIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { selectUser } from '../store/authSlice'
import { selectQuizzes } from '../store/quizSlice'

const Dashboard = () => {
  const user = useSelector(selectUser)
  const quizzes = useSelector(selectQuizzes)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalSessions: 0,
    pendingReviews: 0
  })

  useEffect(() => {
    // Calculate stats from quizzes data
    if (quizzes && quizzes.length > 0) {
      const totalQuizzes = quizzes.length
      const activeQuizzes = quizzes.filter(quiz => quiz.status === 'published').length
      const totalSessions = quizzes.reduce((sum, quiz) => sum + (quiz.sessionCount || 0), 0)
      const pendingReviews = quizzes.reduce((sum, quiz) => sum + (quiz.pendingReviews || 0), 0)

      setStats({
        totalQuizzes,
        activeQuizzes,
        totalSessions,
        pendingReviews
      })
    }
  }, [quizzes])

  const recentActivity = [
    {
      id: 1,
      type: 'quiz_created',
      title: 'JavaScript Fundamentals Quiz',
      description: 'New quiz created',
      timestamp: '2 hours ago',
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'session_started',
      title: 'React Basics Quiz',
      description: 'Student John Doe started the quiz',
      timestamp: '1 hour ago',
      icon: UserGroupIcon,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'suspicious_activity',
      title: 'Python Quiz',
      description: 'Suspicious activity detected',
      timestamp: '30 minutes ago',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600'
    },
    {
      id: 4,
      type: 'quiz_completed',
      title: 'Web Development Quiz',
      description: 'Quiz completed by 15 students',
      timestamp: '15 minutes ago',
      icon: CheckCircleIcon,
      color: 'text-purple-600'
    }
  ]

  const quickActions = [
    {
      title: 'Create Quiz',
      description: 'Start building a new quiz',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      href: '/quizzes/create'
    },
    {
      title: 'View Analytics',
      description: 'Check quiz performance',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      href: '/analytics'
    },
    {
      title: 'Manage Sessions',
      description: 'Monitor active sessions',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      href: '/sessions'
    },
    {
      title: 'Review Submissions',
      description: 'Grade student answers',
      icon: CheckCircleIcon,
      color: 'bg-orange-500',
      href: '/reviews'
    },
    {
      title: 'Manage Quizzes',
      description: 'View, edit and share your quizzes',
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
      href: '/quizzes'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || 'Teacher'}! 👋
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your quizzes today
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Quizzes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        {/* Active Quizzes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeQuizzes}</p>
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.a
              key={action.title}
              href={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{activity.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500">{activity.timestamp}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Score */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">87%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
          </div>
          
          {/* Completion Rate */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</div>
          </div>
          
          {/* Active Students */}
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">23</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Students</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
