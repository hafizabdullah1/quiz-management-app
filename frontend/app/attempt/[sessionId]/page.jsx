'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { quizService } from '@/src/services/quizService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   CheckCircleIcon
 } from '@heroicons/react/24/outline';

export default function QuizAttemptPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
     // Timer state removed for MVP
     // tabShiftCount ref removed - no longer needed

         useEffect(() => {
     const fetchSession = async () => {
       try {
         // Simple approach: just get quiz data directly
         const sessionData = await quizService.getSessionDetails(sessionId);
         console.log('Session data received:', sessionData);
         
         setSession(sessionData);
         setQuiz(sessionData.quiz);
         
         // Check localStorage for simple completion tracking
         const quizKey = `quiz_attempted_${sessionData.quiz._id}`;
         const hasAttempted = localStorage.getItem(quizKey);
         
         if (hasAttempted === 'true') {
           setQuizCompleted(true);
           setLoading(false);
           return;
         }
         
         // Initialize empty answers
         setAnswers({});
         setSubmittedAnswers(new Set());
         
       } catch (err) {
         setError(err.message || 'Failed to load quiz session');
       } finally {
         setLoading(false);
       }
     };

     fetchSession();
   }, [sessionId]);

     // No timer logic - removed for MVP

     // Tab shift detection removed for simplicity

     // formatTime function removed - no longer needed

  const handleAnswerChange = (questionIndex, value, optionIndex = null) => {
    const question = quiz.questions[questionIndex];
    let newAnswer = value;

    if (question.type === 'multiple-choice') {
      newAnswer = optionIndex;
    } else if (question.type === 'true-false') {
      newAnswer = value;
    }

    setAnswers(prev => ({
      ...prev,
      [questionIndex]: newAnswer
    }));
  };

     const handleSubmitAnswer = async () => {
     if (!answers[currentQuestionIndex] && answers[currentQuestionIndex] !== 0) {
       toast.error('Please provide an answer before submitting');
       return;
     }

     setSubmitting(true);
     
     try {
       // Simple answer submission - no backend call
       toast.success('Answer submitted successfully!');
       
       // Mark this answer as submitted
       setSubmittedAnswers(prev => new Set([...prev, currentQuestionIndex]));
       
       // Auto-navigate to next question or complete quiz
       if (currentQuestionIndex < quiz.questions.length - 1) {
         // Move to next question
         setCurrentQuestionIndex(prev => prev + 1);
         toast.success('Moving to next question...');
       } else {
         // Last question, complete quiz
         handleCompleteQuiz();
       }
     } catch (err) {
       toast.error('Failed to submit answer');
     } finally {
       setSubmitting(false);
     }
   };

     const handleCompleteQuiz = async () => {
     try {
       // Simple completion - just mark in localStorage
       const quizKey = `quiz_attempted_${quiz._id}`;
       localStorage.setItem(quizKey, 'true');
       
       setQuizCompleted(true);
       toast.success('Quiz completed successfully!');
       
     } catch (err) {
       toast.error('Failed to complete quiz');
     }
   };



  const renderQuestion = (question, index) => {
    const currentAnswer = answers[index];
    const isSubmitted = submittedAnswers.has(index);
    const isCurrentQuestion = index === currentQuestionIndex;

    // If question is submitted and not current, make it read-only
    const isReadOnly = isSubmitted && !isCurrentQuestion;

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className={`flex items-center space-x-3 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={optionIndex}
                  checked={currentAnswer === optionIndex}
                  onChange={isReadOnly ? undefined : () => handleAnswerChange(index, null, optionIndex)}
                  disabled={isReadOnly}
                  className={`w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`${isReadOnly ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {option.text}
                  {isReadOnly && currentAnswer === optionIndex && (
                    <span className="ml-2 text-green-600 dark:text-green-400 text-sm">✓ Submitted</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-3">
            {['true', 'false'].map((value) => (
              <label key={value} className={`flex items-center space-x-3 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={value}
                  checked={currentAnswer === value}
                  onChange={isReadOnly ? undefined : () => handleAnswerChange(index, value)}
                  disabled={isReadOnly}
                  className={`w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`${isReadOnly ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} capitalize`}>
                  {value}
                  {isReadOnly && currentAnswer === value && (
                    <span className="ml-2 text-green-600 dark:text-green-400 text-sm">✓ Submitted</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        );

      case 'text':
      case 'short-answer':
        return (
          <div className="space-y-2">
            <textarea
              value={currentAnswer || ''}
              onChange={isReadOnly ? undefined : (e) => handleAnswerChange(index, e.target.value)}
              disabled={isReadOnly}
              className={`input ${isReadOnly ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
              rows={4}
              placeholder={isReadOnly ? "Answer submitted" : "Type your answer here..."}
            />
            {isReadOnly && (
              <div className="text-green-600 dark:text-green-400 text-sm flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Answer submitted
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={currentAnswer || ''}
              onChange={isReadOnly ? undefined : (e) => handleAnswerChange(index, e.target.value)}
              disabled={isReadOnly}
              className={`input ${isReadOnly ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
              placeholder={isReadOnly ? "Answer submitted" : "Enter your answer"}
            />
            {isReadOnly && (
              <div className="text-green-600 dark:text-green-400 text-sm flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Answer submitted
              </div>
            )}
          </div>
        );

      case 'long-answer':
      case 'essay':
        return (
          <div className="space-y-2">
            <textarea
              value={currentAnswer || ''}
              onChange={isReadOnly ? undefined : (e) => handleAnswerChange(index, e.target.value)}
              disabled={isReadOnly}
              className={`input ${isReadOnly ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
              rows={6}
              placeholder={isReadOnly ? "Answer submitted" : "Type your detailed answer here..."}
            />
            {isReadOnly && (
              <div className="text-green-600 dark:text-green-400 text-sm flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Answer submitted
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Question type "{question.type}" is not yet supported. Please contact your instructor.
            </p>
            <textarea
              value={currentAnswer || ''}
              onChange={isReadOnly ? undefined : (e) => handleAnswerChange(index, e.target.value)}
              disabled={isReadOnly}
              className={`input ${isReadOnly ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
              rows={4}
              placeholder={isReadOnly ? "Answer submitted" : "Type your answer here..."}
            />
            {isReadOnly && (
              <div className="text-green-600 dark:text-green-400 text-sm flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Answer submitted
              </div>
            )}
          </div>
        );
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Quiz</h1>
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

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 card">
          <div className="text-green-500 text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Thank you for completing the quiz.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Quiz Not Available</h1>
          <p className="text-gray-600 dark:text-gray-400">This quiz session is not accessible.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
                 {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="card mb-6"
         >
           <div className="card-body">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
               <div>
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{quiz.title}</h1>
                 <p className="text-gray-600 dark:text-gray-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Total Quiz Points: {quiz.totalPoints}</p>
               </div>
               
               {/* Quiz Timer */}
               <div className="text-right">
                 <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quiz Time Limit</div>
                 <div className="text-2xl font-bold text-gray-400">
                   {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No limit'}
                 </div>
               </div>
             </div>

                         {/* Progress Bar */}
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
               <div 
                 className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                 style={{ width: `${progress}%` }}
               ></div>
             </div>
             
             {/* Question Status Indicators */}
             <div className="flex flex-wrap gap-2">
               {quiz.questions.map((_, index) => (
                 <div
                   key={index}
                   className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                     index === currentQuestionIndex
                       ? 'bg-primary-600 border-primary-600 scale-125'
                       : submittedAnswers.has(index)
                       ? 'bg-green-500 border-green-500'
                       : 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500'
                   }`}
                   title={`Question ${index + 1}${submittedAnswers.has(index) ? ' - Answered' : ' - Not answered'}`}
                 />
               ))}
             </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card overflow-hidden"
        >
          {/* Question Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {currentQuestion.type.replace('-', ' ').toUpperCase()}
              </span>
              
                             {/* Question Timer */}
               <div className="text-right">
                 <div className="text-sm text-primary-100 mb-1">Question Time Limit</div>
                 <div className="text-xl font-bold text-primary-200">
                   {currentQuestion.timeLimit ? `${currentQuestion.timeLimit} minutes` : 'No limit'}
                 </div>
               </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.question}</h2>
            
                         <div className="flex items-center space-x-4 text-sm text-primary-100">
               <span>Points: {currentQuestion.points}</span>
               {currentQuestion.explanation && (
                 <>
                   <span>|</span>
                   <span>Has explanation</span>
                 </>
               )}
             </div>
          </div>

          {/* Question Content */}
          <div className="card-body">
            <div className="mb-6">
              {renderQuestion(currentQuestion, currentQuestionIndex)}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || (!answers[currentQuestionIndex] && answers[currentQuestionIndex] !== 0)}
                    className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit & Next'}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || (!answers[currentQuestionIndex] && answers[currentQuestionIndex] !== 0)}
                    className="btn-success px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit & Complete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

                 {/* Tab shift warning removed for simplicity */}
      </div>
    </div>
  );
}
