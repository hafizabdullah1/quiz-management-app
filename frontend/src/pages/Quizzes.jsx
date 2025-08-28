import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  LinkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { selectQuizzes, selectQuizzesLoading } from '../store/quizSlice'
import { fetchQuizzes, deleteQuiz, updateQuiz } from '../store/quizSlice'
import Loading from '../components/common/Loading'
import { Toaster, toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const Quizzes = () => {
  const dispatch = useDispatch()
  const quizzes = useSelector(selectQuizzes)
  const isLoading = useSelector(selectQuizzesLoading)
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    dispatch(fetchQuizzes())
  }, [dispatch])

  const handleDeleteQuiz = async (quizId) => {
    try {
      await dispatch(deleteQuiz(quizId)).unwrap()
      setShowDeleteModal(false)
      setSelectedQuiz(null)
    } catch (error) {
      console.error('Failed to delete quiz:', error)
    }
  }

  const handleToggleStatus = async (quizId, isActive) => {
    try {
      await dispatch(updateQuiz({ id: quizId, quizData: { isActive: !isActive } })).unwrap()
      toast.success(!isActive ? 'Quiz published' : 'Quiz paused')
    } catch (error) {
      console.error('Failed to toggle quiz status:', error)
      toast.error('Failed to update quiz status')
    }
  }

  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt)
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt)
          break
        case 'sessionCount':
          comparison = (a.sessionCount || 0) - (b.sessionCount || 0)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getStatusBadge = (isActive) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300', text: 'Active' },
      paused: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: 'Paused' }
    }
    const config = isActive ? statusConfig.active : statusConfig.paused
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading quizzes..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Management</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create, manage, and monitor your quizzes
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/quizzes/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
                <option value="sessionCount">Sessions</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No quizzes found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first quiz.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/quizzes/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Quiz
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Quiz Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {quiz.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {quiz.description || 'No description provided'}
                        </p>
                      </div>
                      
                      {/* Actions Menu */}
                      <div className="relative ml-4">
                        <button
                          onClick={() => setSelectedQuiz(quiz)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                        </button>
                        
                        {selectedQuiz?._id === quiz._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <div className="py-1">
                              <Link
                                href={`/quizzes/${quiz._id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <EyeIcon className="w-4 h-4 mr-3" />
                                View Details
                              </Link>
                              <button
                                onClick={async () => {
                                  const origin = typeof window !== 'undefined' ? window.location.origin : ''
                                  const link = quiz.shareableLink ? `${origin}/quiz/${quiz.shareableLink}` : ''
                                  if (!link) return
                                  try {
                                    await navigator.clipboard.writeText(link)
                                    toast.success('Share link copied')
                                  } catch {
                                    toast.success(link)
                                  }
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <LinkIcon className="w-4 h-4 mr-3" />
                                Copy Share Link
                              </button>

                              
                              <Link
                                href={`/quizzes/${quiz._id}/edit`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <PencilIcon className="w-4 h-4 mr-3" />
                                Edit Quiz
                              </Link>
                              
                              <button
                                onClick={() => handleToggleStatus(quiz._id, quiz.isActive)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {quiz.isActive ? (
                                  <>
                                    <PauseIcon className="w-4 h-4 mr-3" />
                                    Pause Quiz
                                  </>
                                ) : (
                                  <>
                                    <PlayIcon className="w-4 h-4 mr-3" />
                                    Publish Quiz
                                  </>
                                )}
                              </button>
                              
                              <Link
                                href={`/analytics/quiz/${quiz._id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <ChartBarIcon className="w-4 h-4 mr-3" />
                                View Analytics
                              </Link>
                              
                              <button
                                onClick={() => {
                                  setSelectedQuiz(quiz)
                                  setShowDeleteModal(true)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <TrashIcon className="w-4 h-4 mr-3" />
                                Delete Quiz
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quiz Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{quiz.questionCount || 0} questions</span>
                        <span>{quiz.attemptsCount || 0} attempts</span>
                      </div>
                      {getStatusBadge(quiz.isActive)}
                    </div>

                    {/* Quiz Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                      {quiz.timeLimit && (
                        <span>{quiz.timeLimit} min</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Quiz
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedQuiz.title}"? This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedQuiz(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuiz(selectedQuiz._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Quiz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {selectedQuiz && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSelectedQuiz(null)}
        />
      )}
    </div>
  )
}

export default Quizzes
