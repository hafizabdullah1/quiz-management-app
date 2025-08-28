'use client'

import React from 'react'
import Register from '../../src/pages/Register'
import AuthGuard from '../../src/components/common/AuthGuard'

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <Register />
    </AuthGuard>
  )
}
