import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CreateOrder from '@/pages/cashier/CreateOrder'
import OrderHistory from '@/pages/cashier/OrderHistory'
import RefundPage from '@/pages/cashier/refund/RefundPage'
import ShiftSummery from '@/pages/cashier/shift-report/ShiftSummery'
import CashierSettingsPage from '@/pages/cashier/settings/SettingsPage'
import CashierCustomersPage from '@/pages/cashier/customers/CustomersPage'
import { CartProvider } from '@/contexts/CartContext'
import { useSideBar } from '@/contexts/hook/useSideBar'
import PosSidebar from '@/pages/cashier/sidebar/PosSidebar'
import POSHeader from '@/pages/cashier/header/POSHeader'

const CashierLayout = ({ children }) => {
  const sidebar = useSideBar()

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <POSHeader onMenuClick={sidebar.openSidebar} />
      <PosSidebar isOpen={sidebar.isOpen} onClose={sidebar.closeSidebar} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

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
    </Routes>
  )
}

export default CashierRoutes

