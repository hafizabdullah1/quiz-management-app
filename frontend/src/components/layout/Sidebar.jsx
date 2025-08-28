'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  AcademicCapIcon,
  ClockIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'

import { selectUser } from '../../store/authSlice'

const Sidebar = ({ user, onClose, isMobile }) => {
  const pathname = usePathname()
  const currentUser = useSelector(selectUser)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['teacher', 'admin']
    },
    {
      name: 'Quiz Management',
      href: '/quizzes',
      icon: DocumentTextIcon,
      roles: ['teacher', 'admin']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      roles: ['teacher', 'admin']
    },
    {
      name: 'Student Sessions',
      href: '/sessions',
      icon: UserGroupIcon,
      roles: ['teacher', 'admin']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      roles: ['teacher', 'admin']
    }
  ]

  const isActiveRoute = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(currentUser?.role)
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quiz Manager
          </span>
        </div>
        
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {currentUser?.role || 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  isActiveRoute(item.href)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                }`}
              />
              {item.name}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-3 w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Stats */}
      <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Active Quizzes</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">5</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Today's Sessions</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">12</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Pending Reviews</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">3</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <ClockIcon className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
