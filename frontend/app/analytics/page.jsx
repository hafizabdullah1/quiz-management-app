'use client'

import React from 'react'
import AnalyticsDashboard from '@/src/pages/Analytics'
import Layout from '@/src/components/layout/Layout'
import AuthGuard from '@/src/components/common/AuthGuard'

export default function AnalyticsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Layout>
        <AnalyticsDashboard />
      </Layout>
    </AuthGuard>
  )
}
