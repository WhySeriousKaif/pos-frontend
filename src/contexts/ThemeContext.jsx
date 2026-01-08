import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Check localStorage for saved theme preference, default to light
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

