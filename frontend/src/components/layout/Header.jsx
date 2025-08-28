'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

import { logoutUser } from '../../store/authSlice'
import { useTheme } from '../../contexts/ThemeContext'
import { selectUser } from '../../store/authSlice'

const Header = ({ onMenuClick, user }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  const dispatch = useDispatch()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const currentUser = useSelector(selectUser)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
    setNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    setUserMenuOpen(false)
  }

  const closeMenus = () => {
    setUserMenuOpen(false)
    setNotificationsOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo/Brand */}
          <div className="ml-4 lg:ml-0">
            <Link href="/dashboard" className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                Quiz Manager
              </span>
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 relative"
            >
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Notifications
                      </h3>
                      <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                        Mark all as read
                      </button>
                    </div>
                    
                    {/* Sample Notifications */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            New quiz submission from <span className="font-medium">John Doe</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-success-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Quiz "JavaScript Basics" completed by 15 students
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href="/notifications"
                        className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentUser?.name || 'User'}
              </span>
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="py-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {currentUser?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {currentUser?.role || 'User'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={closeMenus}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <UserCircleIcon className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        href="/settings"
                        onClick={closeMenus}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          closeMenus()
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(userMenuOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenus}
        />
      )}
    </header>
  )
}

export default Header
