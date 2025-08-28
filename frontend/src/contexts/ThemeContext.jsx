import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return 'light' // Default for SSR
    }
    
    // Check localStorage first, then system preference, default to light
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  const [isSystemTheme, setIsSystemTheme] = useState(false)

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setIsSystemTheme(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }

  // Function to set specific theme
  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme)
    setIsSystemTheme(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }

  // Function to use system theme
  const useSystemTheme = () => {
    setIsSystemTheme(true)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme')
    }
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  // Effect to apply theme to document
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(theme)
    
    // Set data attribute for CSS custom properties
    root.setAttribute('data-theme', theme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff')
    }
  }, [theme])

  // Effect to listen for system theme changes
  useEffect(() => {
    if (!isSystemTheme || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isSystemTheme])

  // Effect to sync with system theme on mount
  useEffect(() => {
    if (isSystemTheme && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }
  }, [isSystemTheme])

  const value = {
    theme,
    isSystemTheme,
    toggleTheme,
    setSpecificTheme,
    useSystemTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
