'use client'

import React from 'react'
import Dashboard from '../../src/pages/Dashboard'
import Layout from '../../src/components/layout/Layout'
import AuthGuard from '../../src/components/common/AuthGuard'

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Layout>
        <Dashboard />
      </Layout>
    </AuthGuard>
  )
}
