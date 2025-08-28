'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { quizService } from '@/src/services/quizService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PencilIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function PublicQuizPage() {
  const { shareableLink } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await quizService.getQuizByShareableLink(shareableLink);
        setQuiz(quizData);
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [shareableLink]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentName.trim() || !formData.studentEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.studentEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    
    try {
      const session = await quizService.startQuizSession(shareableLink, formData);
      
      // Store attempt in localStorage to prevent re-attempts
      localStorage.setItem(`quiz_attempt_${shareableLink}`, JSON.stringify({
        sessionId: session.sessionId,
        studentName: formData.studentName,
        studentEmail: formData.studentEmail,
        timestamp: Date.now()
      }));
      
      toast.success('Quiz session started!');
      
      // Redirect to attempt page
      window.location.href = `/attempt/${session.sessionId}`;
    } catch (err) {
      toast.error(err.message || 'Failed to start quiz session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Quiz Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Quiz Not Available</h1>
          <p className="text-gray-600 dark:text-gray-400">This quiz is not accessible at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-primary-100 text-lg">{quiz.description}</p>
          </div>

          <div className="card-body">
            {/* Quiz Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Questions: {quiz.questionCount || 0}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Total Points: {quiz.totalPoints || 0}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Time Limit: {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Difficulty: {quiz.difficulty || 'Not specified'}</span>
                </div>
              </div>

              {/* Quiz Rules */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                  Quiz Rules
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Do not switch browser tabs or windows</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ClockIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Each question has a time limit</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <DocumentTextIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Answers are auto-saved as you type</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ArrowPathIcon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>You can navigate between questions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <PencilIcon className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Submit each question before moving to next</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Start Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <PlayIcon className="w-6 h-6 mr-2" />
                Start Quiz
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="studentEmail"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Starting Quiz...
                    </span>
                  ) : (
                    'Start Quiz Now'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  By starting this quiz, you agree to follow the rules above
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
