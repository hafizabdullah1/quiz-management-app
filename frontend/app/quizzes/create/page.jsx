'use client'

import React from 'react'
import CreateQuiz from '../../../src/pages/CreateQuiz'
import AuthGuard from '../../../src/components/common/AuthGuard'

export default function CreateQuizPage() {
  return (
    <AuthGuard requireAuth={true}>
      <CreateQuiz />
    </AuthGuard>
  )
}
