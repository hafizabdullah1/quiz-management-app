'use client'

import React from 'react'
import Quizzes from '../../src/pages/Quizzes'
import Layout from '../../src/components/layout/Layout'
import AuthGuard from '../../src/components/common/AuthGuard'

export default function QuizzesPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Layout>
        <Quizzes />
      </Layout>
    </AuthGuard>
  )
}
