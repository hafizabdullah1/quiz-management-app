'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, selectToken, getCurrentUser, logout } from '../../store/authSlice'
import Loading from './Loading'

const AuthGuard = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectToken)
  const user = useSelector(state => state.auth.user)
  const isLoading = useSelector(state => state.auth.isLoading)
  
  const [isChecking, setIsChecking] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Debug logging
  console.log('AuthGuard Debug:', { 
    pathname, 
    requireAuth, 
    isAuthenticated, 
    token: !!token, 
    user: !!user,
    isLoading, 
    isChecking, 
    hasRedirected
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthGuard: Starting auth check for path:', pathname, 'requireAuth:', requireAuth)
        
        // If we have a token but no user, try to get current user
        if (token && !isAuthenticated) {
          console.log('AuthGuard: Token exists but user not authenticated, getting current user...')
          try {
            await dispatch(getCurrentUser()).unwrap()
            console.log('AuthGuard: Successfully got current user')
          } catch (error) {
            console.error('AuthGuard: Failed to get current user:', error)
            // Token is invalid, clear it and redirect to login
            dispatch(logout())
            if (requireAuth && !hasRedirected) {
              console.log('AuthGuard: Redirecting to login due to invalid token')
              setHasRedirected(true)
              router.replace(redirectTo)
            }
            return
          }
        }

        // Handle route protection
        if (requireAuth && !isAuthenticated) {
          // User is not authenticated and route requires auth
          if (!hasRedirected) {
            console.log('AuthGuard: Route requires auth but user not authenticated, redirecting to:', redirectTo)
            setHasRedirected(true)
            router.replace(redirectTo)
          }
          return
        }

        if (!requireAuth && isAuthenticated) {
          // User is authenticated but trying to access public route (like login/register)
          if (!hasRedirected) {
            console.log('AuthGuard: User authenticated but accessing public route, redirecting to dashboard')
            setHasRedirected(true)
            router.replace('/dashboard')
          }
          return
        }

        // All checks passed
        console.log('AuthGuard: All checks passed for path:', pathname, 'rendering children')
        setIsChecking(false)
      } catch (error) {
        console.error('AuthGuard: Auth check error:', error)
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, token, user, requireAuth, redirectTo, router, dispatch, hasRedirected, pathname])

  // Show loading while checking auth or if still loading
  if (isLoading || isChecking || (token && !isAuthenticated)) {
    console.log('AuthGuard: Showing loading state for path:', pathname)
    return <Loading fullScreen text="Checking authentication..." />
  }

  // If route requires auth and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    console.log('AuthGuard: Route requires auth but user not authenticated, not rendering for path:', pathname)
    return null
  }

  // If route doesn't require auth and user is authenticated, don't render children
  if (!requireAuth && isAuthenticated) {
    console.log('AuthGuard: User authenticated but accessing public route, not rendering for path:', pathname)
    return null
  }

  console.log('AuthGuard: Rendering children for path:', pathname)
  return <>{children}</>
}

export default AuthGuard
