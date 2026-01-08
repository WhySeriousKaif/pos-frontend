import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { registerUser, clearError } from '@/store/slices/authSlice'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'ROLE_BRANCH_CASHIER',
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      const role = user.role
      if (role === 'ROLE_BRANCH_MANAGER' || role === 'ROLE_STORE_MANAGER') {
        navigate('/branch')
      } else if (role === 'ROLE_BRANCH_CASHIER' || role === 'ROLE_CASHIER') {
        navigate('/cashier')
      } else if (role === 'ROLE_ADMIN') {
        navigate('/super-admin')
      } else {
        navigate('/cashier')
      }
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
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

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value,
    })
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email || !formData.password) {
      return
    }

    try {
      const result = await dispatch(registerUser(formData))
      if (registerUser.fulfilled.match(result)) {
        // Navigation will happen in useEffect
      }
    } catch (err) {
      console.error('Registration error:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Enter your information to create a new account
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
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
              <label htmlFor="phone" className="text-sm font-medium">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_BRANCH_CASHIER">Cashier</SelectItem>
                  <SelectItem value="ROLE_BRANCH_MANAGER">Branch Manager</SelectItem>
                  <SelectItem value="ROLE_CASHIER">Cashier (Legacy)</SelectItem>
                </SelectContent>
              </Select>
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
                  minLength={6}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register

