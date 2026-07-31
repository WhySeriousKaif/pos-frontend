import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CreateOrder from '@/pages/cashier/CreateOrder'
import OrderHistory from '@/pages/cashier/OrderHistory'
import RefundPage from '@/pages/cashier/refund/RefundPage'
import ShiftSummery from '@/pages/cashier/shift-report/ShiftSummery'
import CashierSettingsPage from '@/pages/cashier/settings/SettingsPage'
import CashierCustomersPage from '@/pages/cashier/customers/CustomersPage'
import { CartProvider } from '@/contexts/CartContext'
import CashierLayout from '@/pages/cashier/layout/CashierLayout'

const CashierRoutes = () => {
  return (
    <Routes>
      <Route
        path="orders"
        element={
          <CashierLayout>
            <OrderHistory />
          </CashierLayout>
        }
      />
      <Route
        path="returns"
        element={
          <CashierLayout>
            <RefundPage />
          </CashierLayout>
        }
      />
      <Route
        path="shift-summary"
        element={
          <CashierLayout>
            <ShiftSummery />
          </CashierLayout>
        }
      />
      <Route
        path="customers"
        element={
          <CashierLayout>
            <CashierCustomersPage />
          </CashierLayout>
        }
      />
      <Route
        path="settings"
        element={
          <CashierLayout>
            <CashierSettingsPage />
          </CashierLayout>
        }
      />
      <Route
        path="/"
        element={
          <CashierLayout>
            <CartProvider>
              <CreateOrder />
            </CartProvider>
          </CashierLayout>
        }
      />
      <Route path="*" element={<Navigate to="/cashier" replace />} />
    </Routes>
  )
}

export default CashierRoutes
