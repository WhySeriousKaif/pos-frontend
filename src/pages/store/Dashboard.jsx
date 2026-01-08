import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  storeAPI, 
  branchAPI, 
  productAPI, 
  userAPI, 
  orderAPI,
  employeeAPI 
} from '@/services/api'
import {
  DollarSign,
  Store,
  Package,
  Users,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const StoreAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalBranches: 0,
    totalProducts: 0,
    totalEmployees: 0,
  })
  const [recentSales, setRecentSales] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get user profile to fetch store ID
      let currentStoreId = storeId
      try {
        const profile = await userAPI.getProfile()
        if (profile?.storeId) {
          currentStoreId = profile.storeId
          setStoreId(profile.storeId)
        } else {
          // Try to get store by admin
          try {
            const stores = await storeAPI.getByAdmin()
            if (stores && stores.length > 0) {
              currentStoreId = stores[0].id
              setStoreId(stores[0].id)
            }
          } catch (storeErr) {
            // Store not found - admin needs to create a store first
            console.log('No store found for admin. Please create a store first.')
          }
        }
      } catch (err) {
        console.error('Error fetching store ID:', err)
      }

      if (!currentStoreId) {
        // No store ID found - show message to create store
        setLoading(false)
        return
      }

      // Fetch all data in parallel
      const [branches, products, allUsers, allOrders] = await Promise.all([
        branchAPI.getByStoreId(currentStoreId).catch(() => []),
        productAPI.getByStoreId(currentStoreId).catch(() => []),
        userAPI.getAll().catch(() => []),
        // Get orders from all branches
        Promise.all(
          (await branchAPI.getByStoreId(currentStoreId).catch(() => [])).map(branch =>
            orderAPI.getByBranch(branch.id).catch(() => [])
          )
        ).then(results => results.flat()).catch(() => []),
      ])

      // Filter employees for this store
      const storeEmployees = allUsers.filter(user => 
        user.storeId === currentStoreId || user.store?.id === currentStoreId
      )

      // Calculate total sales from all orders
      const totalSales = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

      // Get recent sales (last 5 orders)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const recent = allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => {
          const orderDate = new Date(order.createdAt)
          let dateLabel = format(orderDate, 'MMM d, yyyy')
          
          if (orderDate.toDateString() === today.toDateString()) {
            dateLabel = 'Today'
          } else if (orderDate.toDateString() === yesterday.toDateString()) {
            dateLabel = 'Yesterday'
          }
          
          return {
            id: order.id,
            branchName: order.branch?.name || 'Unknown Branch',
            date: order.createdAt,
            dateLabel,
            amount: order.totalAmount || 0,
          }
        })

      setRecentSales(recent)

      // Prepare sales data for last 7 days
      const salesByDay = {}
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const dateStr = format(date, 'MMM dd')
        salesByDay[dateStr] = 0
        return dateStr
      })

      allOrders.forEach((order) => {
        const orderDate = new Date(order.createdAt)
        const dateStr = format(orderDate, 'MMM dd')
        if (salesByDay.hasOwnProperty(dateStr)) {
          salesByDay[dateStr] += order.totalAmount || 0
        }
      })

      setSalesData(
        last7Days.map((day) => ({
          date: day,
          sales: salesByDay[day] || 0,
        }))
      )

      setStats({
        totalSales,
        totalBranches: branches.length,
        totalProducts: products.length,
        totalEmployees: storeEmployees.length,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">POS Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your store performance
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Store className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBranches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Sales Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Trend</CardTitle>
              <select className="text-sm border rounded px-2 py-1">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{sale.branchName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.dateLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{sale.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No recent sales</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StoreAdminDashboard

