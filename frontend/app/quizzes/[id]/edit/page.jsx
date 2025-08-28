'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useRouter } from 'next/navigation'
import { getQuizById, updateQuiz, selectCurrentQuiz, selectQuizLoading } from '../../../../src/store/quizSlice'
import AuthGuard from '../../../../src/components/common/AuthGuard'

const EditQuizContent = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const quiz = useSelector(selectCurrentQuiz)
  const loading = useSelector(selectQuizLoading)
  const [form, setForm] = useState(null)
  const [questionsForm, setQuestionsForm] = useState([])

  useEffect(() => {
    if (params?.id) dispatch(getQuizById(params.id))
  }, [dispatch, params?.id])

  useEffect(() => {
    if (quiz) {
      setForm({
        title: quiz.title || '',
        description: quiz.description || '',
        timeLimit: quiz.timeLimit || '',
        isActive: !!quiz.isActive,
      })
      setQuestionsForm((quiz.questions || []).map(q => ({
        id: q._id,
        question: q.question,
        type: q.type,
        options: (q.options || []).map(o => ({ id: o._id, text: o.text, isCorrect: o.isCorrect })),
        correctAnswer: q.correctAnswer || '',
        points: q.points || 1,
        timeLimit: q.timeLimit || '',
        explanation: q.explanation || ''
      })))
    }
  }, [quiz])

  if (loading || !form) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">Loading...</div>
  }

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateQuiz({ id: params.id, quizData: {
        title: form.title,
        description: form.description,
        timeLimit: form.timeLimit ? parseInt(form.timeLimit) : null,
        isActive: form.isActive,
        questions: questionsForm.map(q => ({
          question: q.question,
          type: q.type,
          options: q.type === 'multiple-choice' ? q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })) : undefined,
          correctAnswer: q.type !== 'multiple-choice' ? q.correctAnswer : undefined,
          points: parseInt(q.points || 1),
          timeLimit: q.timeLimit ? parseInt(q.timeLimit) : undefined,
          explanation: q.explanation
        }))
      }})).unwrap()
      router.push('/quizzes')
    } catch (err) {
      console.error(err)
    }
  }

  // Question editing helpers
  const addQuestion = () => {
    setQuestionsForm(prev => ([...prev, {
      id: Date.now().toString(),
      question: '',
      type: 'multiple-choice',
      options: [
        { id: 'o1', text: '', isCorrect: false },
        { id: 'o2', text: '', isCorrect: false },
      ],
      points: 1,
      timeLimit: '',
      explanation: ''
    }]))
  }

  const removeQuestion = (qid) => {
    setQuestionsForm(prev => prev.filter(q => q.id !== qid))
  }

  const updateQuestionField = (qid, field, value) => {
    setQuestionsForm(prev => prev.map(q => q.id === qid ? { ...q, [field]: value } : q))
  }

  const addOption = (qid) => {
    setQuestionsForm(prev => prev.map(q => q.id === qid ? { ...q, options: [...(q.options||[]), { id: Date.now().toString(), text: '', isCorrect: false }] } : q))
  }

  const removeOption = (qid, oid) => {
    setQuestionsForm(prev => prev.map(q => q.id === qid ? { ...q, options: (q.options||[]).filter(o => o.id !== oid) } : q))
  }

  const updateOptionField = (qid, oid, field, value) => {
    setQuestionsForm(prev => prev.map(q => {
      if (q.id !== qid) return q
      const options = (q.options||[]).map(o => o.id === oid ? { ...o, [field]: value } : o)
      return { ...q, options }
    }))
  }

  const markCorrectOption = (qid, oid) => {
    setQuestionsForm(prev => prev.map(q => {
      if (q.id !== qid) return q
      const options = (q.options||[]).map(o => ({ ...o, isCorrect: o.id === oid }))
      return { ...q, options }
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input value={form.title} onChange={(e)=>handleChange('title', e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea value={form.description} onChange={(e)=>handleChange('description', e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (minutes)</label>
            <input type="number" value={form.timeLimit} onChange={(e)=>handleChange('timeLimit', e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
          </div>
          <label className="flex items-center mt-6">
            <input type="checkbox" checked={form.isActive} onChange={(e)=>handleChange('isActive', e.target.checked)} className="mr-2" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
          </label>
        </div>
        {/* Questions editor */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Questions</h2>
          {questionsForm.map((q, idx) => (
            <div key={q.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Question {idx+1}</div>
                <button type="button" onClick={() => removeQuestion(q.id)} className="text-red-600 text-sm">Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={q.question} onChange={(e)=>updateQuestionField(q.id,'question',e.target.value)} placeholder="Question text" className="md:col-span-2 border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
                <select value={q.type} onChange={(e)=>updateQuestionField(q.id,'type',e.target.value)} className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>
              {q.type === 'multiple-choice' ? (
                <div className="space-y-2">
                  {(q.options||[]).map((o) => (
                    <div key={o.id} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${q.id}`} checked={o.isCorrect} onChange={()=>markCorrectOption(q.id, o.id)} />
                      <input value={o.text} onChange={(e)=>updateOptionField(q.id, o.id, 'text', e.target.value)} className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" placeholder="Option text" />
                      <button type="button" onClick={()=>removeOption(q.id,o.id)} className="text-sm text-red-600">Delete</button>
                    </div>
                  ))}
                  <button type="button" onClick={()=>addOption(q.id)} className="text-sm text-primary-600">+ Add option</button>
                </div>
              ) : (
                <input value={q.correctAnswer} onChange={(e)=>updateQuestionField(q.id,'correctAnswer',e.target.value)} placeholder="Correct answer" className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="number" value={q.points} min="1" onChange={(e)=>updateQuestionField(q.id,'points',e.target.value)} className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" placeholder="Points" />
                <input type="number" value={q.timeLimit} min="1" onChange={(e)=>updateQuestionField(q.id,'timeLimit',e.target.value)} className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" placeholder="Time limit (sec)" />
                <input value={q.explanation} onChange={(e)=>updateQuestionField(q.id,'explanation',e.target.value)} className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" placeholder="Explanation (optional)" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="text-sm text-primary-600">+ Add question</button>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary px-4 py-2">Save</button>
          <button type="button" onClick={()=>router.push('/quizzes')} className="px-4 py-2 border rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAuth={true}>
      <EditQuizContent />
    </AuthGuard>
  )
}


