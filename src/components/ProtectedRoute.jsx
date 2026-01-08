import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { userAPI } from '@/services/api'
import { setUser, logoutUser } from '@/store/slices/authSlice'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [verifying, setVerifying] = useState(true)

  // Verify token on mount if token exists but user is not authenticated
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')
      
      // If we have a token but Redux state says not authenticated, verify it
      if (storedToken && !isAuthenticated) {
        try {
          setVerifying(true)
          const userProfile = await userAPI.getProfile()
          // Token is valid, restore user state
          if (userProfile) {
            dispatch(setUser(userProfile))
          }
        } catch (error) {
          // Token is invalid or expired, clear it
          console.error('Token verification failed:', error)
          dispatch(logoutUser())
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        } finally {
          setVerifying(false)
        }
      } else {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [dispatch, isAuthenticated])

  if (loading || verifying) {
    return <div className="flex items-center justify-center h-screen">Loading authentication...</div>
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/auth/login" replace />
  }

  // Get role from user object (user.role or user.authorities[0].authority)
  const userRole = user?.role || user?.authorities?.[0]?.authority

  // If allowedRoles is specified and user role is not in the list, redirect
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    // Redirect based on user role
    if (userRole === 'ROLE_ADMIN') {
      return <Navigate to="/super-admin" replace />
    } else if (userRole === 'ROLE_STORE_ADMIN') {
      return <Navigate to="/store" replace />
    } else if (userRole === 'ROLE_BRANCH_MANAGER' || userRole === 'ROLE_STORE_MANAGER') {
      return <Navigate to="/branch" replace />
    } else if (userRole === 'ROLE_BRANCH_CASHIER' || userRole === 'ROLE_CASHIER') {
      return <Navigate to="/cashier" replace />
    }
    return <Navigate to="/cashier" replace />
  }

  return children
}

export default ProtectedRoute

