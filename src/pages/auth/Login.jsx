import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginUser, clearError } from '@/store/slices/authSlice'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Only redirect if user just successfully logged in (not from localStorage)
    // Check if there's a valid token and user, but also verify it's a fresh login
    // We'll only redirect after successful login, not on initial load
    // This prevents redirecting users with expired/invalid tokens
    if (isAuthenticated && user && !loading) {
      // Verify token is valid by checking if we can access user profile
      // If token is invalid, ProtectedRoute will handle redirect to login
      const role = user.role || user.authorities?.[0]?.authority
      // Only redirect if we have a valid role
      if (role) {
        // ROLE_ADMIN is Super Admin (only kaiftruth101@gmail.com) → /super-admin
        if (role === 'ROLE_ADMIN') {
          navigate('/super-admin')
        } else if (role === 'ROLE_STORE_ADMIN') {
          // ROLE_STORE_ADMIN is Store Admin (can be many) → /store
          navigate('/store')
        } else if (role === 'ROLE_BRANCH_MANAGER' || role === 'ROLE_STORE_MANAGER') {
          navigate('/branch')
        } else if (role === 'ROLE_BRANCH_CASHIER' || role === 'ROLE_CASHIER') {
          navigate('/cashier')
        } else {
          navigate('/cashier')
        }
      }
    }
  }, [isAuthenticated, user, loading, navigate])

  useEffect(() => {
    // Clear error when component unmounts or form changes
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      return
    }

    try {
      const result = await dispatch(loginUser(formData))
      if (loginUser.fulfilled.match(result)) {
        // Navigation will happen in useEffect
      }
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/auth/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login

