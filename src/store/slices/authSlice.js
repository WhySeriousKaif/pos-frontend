import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '@/services/api'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      // Store token in localStorage
      if (response.jwt) {
        localStorage.setItem('authToken', response.jwt)
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData)
      // Store token in localStorage
      if (response.jwt) {
        localStorage.setItem('authToken', response.jwt)
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
)

// Helper function to safely parse JSON from localStorage
const safeParseJSON = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    return JSON.parse(item)
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    localStorage.removeItem(key)
    return defaultValue
  }
}

// Initial state
// Don't set isAuthenticated to true just because token exists
// Token might be expired or invalid - let ProtectedRoute verify it
const initialState = {
  user: safeParseJSON('user', null),
  token: localStorage.getItem('authToken') || null,
  isAuthenticated: false, // Start as false, will be set to true only after successful login
  loading: false,
  error: null,
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user || action.payload
        state.token = action.payload.jwt
        state.isAuthenticated = true
        state.error = null
        // Safely store user in localStorage
        try {
          if (action.payload.user) {
            localStorage.setItem('user', JSON.stringify(action.payload.user))
          }
        } catch (error) {
          console.error('Error storing user in localStorage:', error)
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.jwt
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer

