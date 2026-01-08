import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './store'
import { ThemeProvider } from './contexts/ThemeContext'
import CashierRoutes from './routes/CashierRoutes'
import BranchRoutes from './routes/BranchRoutes'
import StoreAdminRoutes from './routes/StoreAdminRoutes'
import SuperAdminRoutes from './routes/SuperAdminRoutes'
import AuthRoutes from './routes/AuthRoutes'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/landing/LandingPage'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page - show for unauthenticated users */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/*" element={<AuthRoutes />} />
            <Route
              path="/cashier/*"
              element={
                <ProtectedRoute allowedRoles={['ROLE_BRANCH_CASHIER', 'ROLE_CASHIER']}>
                  <CashierRoutes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branch/*"
              element={
                <ProtectedRoute allowedRoles={['ROLE_BRANCH_MANAGER', 'ROLE_STORE_MANAGER']}>
                  <BranchRoutes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/store/*"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STORE_ADMIN']}>
                  <StoreAdminRoutes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/*"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <SuperAdminRoutes />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

export default App
