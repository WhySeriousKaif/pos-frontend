import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { orderAPI, refundAPI, customerAPI, shiftReportAPI, branchAPI, userAPI } from '@/services/api'
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  CreditCard,
  DollarSign as CashIcon,
  Smartphone,
  RefreshCw,
  Package,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalCustomers: 0,
    activeCashiers: 0,
    totalRefunds: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [salesData, setSalesData] = useState([])
  const [paymentData, setPaymentData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [branchId, setBranchId] = useState(null) // Start with null

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  useEffect(() => {
    fetchBranchId()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchDashboardData()
    }
  }, [branchId])

  const fetchBranchId = async () => {
    try {
      const profile = await userAPI.getProfile()
      if (profile?.branchId) {
        setBranchId(profile.branchId)
      } else {
        console.error('Branch ID not found in user profile')
        alert('Branch not found. Please make sure your user is assigned to a branch.')
      }
    } catch (error) {
      console.error('Error fetching branch ID:', error)
      alert('Failed to fetch branch information. Please refresh the page.')
    }
  }

  const fetchDashboardData = async () => {
    if (!branchId) {
      console.error('Cannot fetch dashboard data: branchId is not set')
      return
    }

    try {
      setLoading(true)

      // Fetch all data in parallel
      const [allOrders, todayOrders, customers, refunds, shiftReports] = await Promise.all([
        orderAPI.getByBranch(branchId).catch(() => []),
        orderAPI.getTodayByBranch(branchId).catch(() => []),
        customerAPI.getAll().catch(() => []),
        refundAPI.getByBranch(branchId).catch(() => []),
        shiftReportAPI.getByBranch(branchId).catch(() => []),
      ])

      // Calculate stats
      const totalSales = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const todaySales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalRefundsAmount = refunds.reduce((sum, refund) => sum + (refund.amount || 0), 0)
      
      // Get active cashiers (cashiers with active shifts today)
      const today = new Date()
      const activeCashiersSet = new Set()
      shiftReports.forEach((shift) => {
        if (shift.shiftStart) {
          const shiftDate = new Date(shift.shiftStart)
          if (
            shiftDate.toDateString() === today.toDateString() &&
            !shift.shiftEnd
          ) {
            activeCashiersSet.add(shift.cashier?.id)
          }
        }
      })

      setStats({
        totalSales: totalSales - totalRefundsAmount, // Net sales
        todaySales,
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        totalCustomers: customers.length || 0,
        activeCashiers: activeCashiersSet.size,
        totalRefunds: refunds.length,
      })

      // Fetch recent orders
      const recent = await orderAPI.getRecentByBranch(branchId).catch(() => [])
      setRecentOrders(recent.slice(0, 5))

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

      // Calculate payment method distribution (dynamic from backend)
      const paymentMethods = {}
      allOrders.forEach((order) => {
        const method = order.paymentType || 'CASH'
        if (!paymentMethods[method]) {
          paymentMethods[method] = 0
        }
        paymentMethods[method] += order.totalAmount || 0
      })

      // Convert to array format dynamically - supports any payment method from backend
      const getPaymentMethodLabel = (method) => {
        const methodMap = {
          CASH: 'Cash',
          CARD: 'Card',
          UPI: 'UPI',
          DEBIT_CARD: 'Debit Card',
          CREDIT_CARD: 'Credit Card',
        }
        return methodMap[method] || method
      }

      setPaymentData(
        Object.entries(paymentMethods).map(([name, value]) => ({
          name: getPaymentMethodLabel(name),
          value,
        }))
      )

      // Calculate top products (simplified - using order items)
      const productSales = {}
      allOrders.forEach((order) => {
        order.orderItems?.forEach((item) => {
          const productId = item.product?.id
          const productName = item.product?.name || 'Unknown'
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                name: productName,
                quantity: 0,
                revenue: 0,
              }
            }
            productSales[productId].quantity += item.quantity || 0
            productSales[productId].revenue += (item.price || 0) * (item.quantity || 0)
          }
        })
      })

      setTopProducts(
        Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      )
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
          <h1 className="text-3xl font-bold">Branch Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your branch performance
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
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Net sales (after refunds)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.todayOrders} orders today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cashiers</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCashiers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently on shift
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <RefreshCw className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRefunds}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Processed refunds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  labelStyle={{ color: '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CashIcon className="size-4 text-[#0088FE]" />
                <span className="text-sm">Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-[#00C49F]" />
                <span className="text-sm">Card</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-[#FFBB28]" />
                <span className="text-sm">UPI</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => `₹${value.toFixed(2)}`}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Package className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No product data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM d, yyyy hh:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.paymentType || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No recent orders</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

