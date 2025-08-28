'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import AuthGuard from '../src/components/common/AuthGuard'

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading Quiz Manager...</p>
    </div>
  </div>
)

// Error boundary component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Page error:', error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Something went wrong</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return children
}

// Home page content component
const HomeContent = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Create Engaging Quizzes',
      description: 'Build comprehensive quizzes with multiple question types, time limits, and scoring systems.'
    },
    {
      icon: UserGroupIcon,
      title: 'Student Management',
      description: 'Track student progress, monitor performance, and manage quiz sessions in real-time.'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Get detailed insights into quiz performance, student progress, and learning outcomes.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Proctoring & Security',
      description: 'Advanced proctoring features including tab monitoring and suspicious activity detection.'
    },
    {
      icon: ClockIcon,
      title: 'Real-time Monitoring',
      description: 'Live tracking of student sessions with instant notifications and alerts.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Professional Tools',
      description: 'Built for educators with features designed to enhance the learning experience.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                Quiz Manager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Transform Your
              <span className="text-gradient block">Quiz Experience</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Create, manage, and analyze quizzes with advanced proctoring, real-time monitoring, 
              and comprehensive analytics. Built for modern education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-primary text-lg px-8 py-4"
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                className="btn-secondary text-lg px-8 py-4"
              >
                Watch Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need for Modern Assessment
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools educators need to create 
              engaging assessments and track student progress effectively.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 text-center hover:shadow-medium transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of educators who are already using Quiz Manager to enhance 
              their teaching and assessment processes.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 text-lg"
            >
              Create Your First Quiz
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="ml-2 text-xl font-bold">Quiz Manager</span>
              </div>
              <p className="text-gray-400">
                Empowering educators with modern assessment tools and comprehensive analytics.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Quiz Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AuthGuard requireAuth={false} redirectTo="/dashboard">
          <HomeContent />
        </AuthGuard>
      </Suspense>
    </ErrorBoundary>
  )
}
