'use client'

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getQuizById, selectCurrentQuiz, selectQuizLoading } from '../../../src/store/quizSlice'
import AuthGuard from '../../../src/components/common/AuthGuard'

const QuizDetailsContent = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const quiz = useSelector(selectCurrentQuiz)
  const isLoading = useSelector(selectQuizLoading)

  useEffect(() => {
    if (params?.id) {
      dispatch(getQuizById(params.id))
    }
  }, [dispatch, params?.id])

  const copyShareLink = async () => {
    if (!quiz?.shareableLink) return
    const full = `${window.location.origin}/quiz/${quiz.shareableLink}`
    try {
      await navigator.clipboard.writeText(full)
      alert('Share link copied!')
    } catch {
      alert(full)
    }
  }

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Loading quiz...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.description || 'No description'}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/quizzes/${quiz._id}/edit`} className="btn-primary px-4 py-2">Edit</Link>
            <button onClick={copyShareLink} className="btn-secondary px-4 py-2">Share</button>
            <Link href="/quizzes" className="px-4 py-2 border rounded-lg text-sm text-gray-700 dark:text-gray-300">Back</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div><span className="font-medium">Questions:</span> {quiz.questions?.length || 0}</div>
            <div><span className="font-medium">Total Points:</span> {quiz.totalPoints || 0}</div>
            <div><span className="font-medium">Time Limit:</span> {quiz.timeLimit ? `${quiz.timeLimit} min` : '—'}</div>
            <div className="md:col-span-3 break-all"><span className="font-medium">Shareable Link:</span> {quiz.shareableLink ? `${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/${quiz.shareableLink}` : 'not available'}</div>
          </div>
        </motion.div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Questions</h2>
          <div className="space-y-4">
            {quiz.questions?.map((q, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{q.type}</div>
                <div className="font-medium text-gray-900 dark:text-white">{q.question}</div>
              </div>
            ))}
            {!quiz.questions?.length && (
              <div className="text-sm text-gray-500 dark:text-gray-400">No questions added.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAuth={true}>
      <QuizDetailsContent />
    </AuthGuard>
  )
}


