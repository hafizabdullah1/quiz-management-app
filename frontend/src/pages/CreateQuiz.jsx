import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { createQuiz } from '../store/quizSlice'

const CreateQuiz = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: '',
    isPublic: false,
    settings: {
      allowReview: true,
      showCorrectAnswers: false,
      randomizeQuestions: false,
      maxAttempts: 1
    }
  })
  
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      type: 'multiple-choice',
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: false },
        { id: 4, text: '', isCorrect: false }
      ],
      points: 1,
      timeLimit: '',
      explanation: ''
    }
  ])
  
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: CheckCircleIcon },
    { value: 'true-false', label: 'True/False', icon: XCircleIcon },
    { value: 'short-answer', label: 'Short Answer', icon: DocumentTextIcon },
    { value: 'essay', label: 'Essay', icon: DocumentTextIcon }
  ]

  const validateForm = () => {
    const newErrors = {}
    
    if (!quizData.title.trim()) {
      newErrors.title = 'Quiz title is required'
    }
    
    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required'
    }
    
    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}`] = 'Question text is required'
      }
      
      if (question.type === 'multiple-choice') {
        const hasCorrectOption = question.options.some(option => option.isCorrect)
        if (!hasCorrectOption) {
          newErrors[`question_${index}_options`] = 'At least one correct option is required'
        }
        
        question.options.forEach((option, optionIndex) => {
          if (!option.text.trim()) {
            newErrors[`question_${index}_option_${optionIndex}`] = 'Option text is required'
          }
        })
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSettingsChange = (setting, value) => {
    setQuizData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }))
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      type: 'multiple-choice',
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: false },
        { id: 4, text: '', isCorrect: false }
      ],
      points: 1,
      timeLimit: '',
      explanation: ''
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  const removeQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const updateQuestion = (questionId, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const updateQuestionOption = (questionId, optionId, field, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const updatedOptions = q.options.map(opt => 
          opt.id === optionId ? { ...opt, [field]: value } : opt
        )
        return { ...q, options: updatedOptions }
      }
      return q
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const quizPayload = {
        ...quizData,
        questions: questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.type === 'multiple-choice' ? q.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect })) : undefined,
          correctAnswer: q.type !== 'multiple-choice' ? q.correctAnswer : undefined,
          points: parseInt(q.points),
          timeLimit: q.timeLimit ? parseInt(q.timeLimit) : undefined,
          explanation: q.explanation
        })),
        timeLimit: quizData.timeLimit ? parseInt(quizData.timeLimit) : undefined
      }
      
      const result = await dispatch(createQuiz(quizPayload)).unwrap()
      router.push(`/quizzes`)
    } catch (error) {
      console.error('Failed to create quiz:', error)
      setIsSubmitting(false)
    }
  }

  const renderQuestionForm = (question, index) => (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Question {index + 1}
        </h3>
        <button
          type="button"
          onClick={() => removeQuestion(question.id)}
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Question Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Question Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {questionTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateQuestion(question.id, 'type', type.value)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                question.type === type.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <type.icon className="h-5 w-5 mx-auto mb-1" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Question Text *
        </label>
        <textarea
          value={question.question}
          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
          rows={3}
          className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter your question here..."
        />
        {errors[`question_${index}`] && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`question_${index}`]}</p>
        )}
      </div>

      {/* Question Options for Multiple Choice */}
      {question.type === 'multiple-choice' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Options *
          </label>
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <div key={option.id} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`correct_${question.id}`}
                  checked={option.isCorrect}
                  onChange={() => {
                    // Uncheck all other options
                    const updatedOptions = question.options.map((opt, idx) => ({
                      ...opt,
                      isCorrect: idx === optionIndex
                    }))
                    updateQuestion(question.id, 'options', updatedOptions)
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateQuestionOption(question.id, option.id, 'text', e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            ))}
          </div>
          {errors[`question_${index}_options`] && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`question_${index}_options`]}</p>
          )}
        </div>
      )}

      {/* Correct Answer for other types */}
      {question.type !== 'multiple-choice' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correct Answer
          </label>
          <input
            type="text"
            value={question.correctAnswer || ''}
            onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter correct answer..."
          />
        </div>
      )}

      {/* Question Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={question.points}
            onChange={(e) => updateQuestion(question.id, 'points', e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            min="1"
            value={question.timeLimit}
            onChange={(e) => updateQuestion(question.id, 'timeLimit', e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Optional"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Explanation
          </label>
          <input
            type="text"
            value={question.explanation}
            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Optional explanation..."
          />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Quiz</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Build engaging quizzes with multiple question types
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {showPreview ? (
                  <>
                    <EyeSlashIcon className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview
                  </>
                )}
              </button>
              
              <Link
                href="/quizzes"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quiz Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => handleQuizDataChange('title', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter quiz title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={quizData.timeLimit}
                  onChange={(e) => handleQuizDataChange('timeLimit', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={quizData.description}
                onChange={(e) => handleQuizDataChange('description', e.target.value)}
                rows={3}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter quiz description..."
              />
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quiz Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizData.settings.allowReview}
                    onChange={(e) => handleSettingsChange('allowReview', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Allow students to review their answers
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizData.settings.showCorrectAnswers}
                    onChange={(e) => handleSettingsChange('showCorrectAnswers', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Show correct answers after submission
                  </span>
                </label>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizData.settings.randomizeQuestions}
                    onChange={(e) => handleSettingsChange('randomizeQuestions', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Randomize question order
                  </span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quizData.settings.maxAttempts}
                    onChange={(e) => handleSettingsChange('maxAttempts', parseInt(e.target.value))}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No questions yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by adding your first question
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {questions.map((question, index) => renderQuestionForm(question, index))}
                {errors.questions && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.questions}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ready to create?</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Review your quiz and click create when you're ready
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link
                  href="/quizzes"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting || questions.length === 0}
                  className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateQuiz
