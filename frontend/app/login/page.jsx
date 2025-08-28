'use client'

import React from 'react'
import Login from '../../src/pages/Login'
import AuthGuard from '../../src/components/common/AuthGuard'

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <Login />
    </AuthGuard>
  )
}
