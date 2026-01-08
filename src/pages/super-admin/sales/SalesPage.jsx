import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Search,
  Download,
  Store,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  orderAPI,
  branchAPI,
  storeAPI,
  refundAPI,
} from '@/services/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const SuperAdminSalesPage = () => {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [allOrders, setAllOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [stores, setStores] = useState([])
  
  // Statistics
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersToday: 0,
    totalRefunds: 0,
    netSales: 0,
  })
  
  // Chart data
  const [salesData, setSalesData] = useState([])
  const [paymentData, setPaymentData] = useState([])
  const [storeSalesData, setStoreSalesData] = useState([])

  useEffect(() => {
    fetchSalesData()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, statusFilter, storeFilter, allOrders])

  const fetchSalesData = async () => {
    try {
      setLoading(true)

      // Fetch all stores
      const allStores = await storeAPI.getAll()
      setStores(allStores)

      // Fetch orders from all branches of all stores
      const allBranches = []
      for (const store of allStores) {
        try {
          const branches = await branchAPI.getByStoreId(store.id).catch(() => [])
          allBranches.push(...branches)
        } catch (error) {
          console.error(`Error fetching branches for store ${store.id}:`, error)
        }
      }

      // Fetch orders from all branches
      const ordersArrays = await Promise.all(
        allBranches.map(branch => orderAPI.getByBranch(branch.id).catch(() => []))
      )
      const orders = ordersArrays.flat()

      // Fetch refunds
      const refundsArrays = await Promise.all(
        allBranches.map(branch => refundAPI.getByBranch(branch.id).catch(() => []))
      )
      const allRefunds = refundsArrays.flat()

      setAllOrders(orders)

      // Calculate statistics
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayOrders = orders.filter(order => {
        if (!order.createdAt) return false
        const orderDate = new Date(order.createdAt)
        return orderDate >= today && orderDate < tomorrow
      })

      const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalRefunds = allRefunds.reduce((sum, refund) => sum + (refund.amount || 0), 0)
      const netSales = totalSales - totalRefunds

      setStats({
        totalSales,
        ordersToday: todayOrders.length,
        totalRefunds: allRefunds.length,
        netSales,
      })

      // Prepare sales data for last 7 days
      const salesByDay = {}
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const dateStr = format(date, 'MMM dd')
        salesByDay[dateStr] = 0
        return dateStr
      })

      orders.forEach((order) => {
        if (order.createdAt) {
          const orderDate = new Date(order.createdAt)
          const dateStr = format(orderDate, 'MMM dd')
          if (salesByDay.hasOwnProperty(dateStr)) {
            salesByDay[dateStr] += order.totalAmount || 0
          }
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
      orders.forEach((order) => {
        const method = order.paymentType || 'CASH'
        if (!paymentMethods[method]) {
          paymentMethods[method] = 0
        }
        paymentMethods[method] += order.totalAmount || 0
      })

      // Convert to array format dynamically
      setPaymentData(
        Object.entries(paymentMethods).map(([name, value]) => ({
          name: getPaymentMethodLabel(name),
          value,
        }))
      )

      // Calculate sales by store
      const salesByStore = {}
      orders.forEach((order) => {
        const storeId = order.branch?.store?.id || order.storeId
        if (storeId) {
          if (!salesByStore[storeId]) {
            salesByStore[storeId] = { storeId, sales: 0, orders: 0 }
          }
          salesByStore[storeId].sales += order.totalAmount || 0
          salesByStore[storeId].orders += 1
        }
      })

      const storeSales = Object.values(salesByStore)
        .map(item => {
          const store = allStores.find(s => s.id === item.storeId)
          return {
            name: store?.brand || store?.name || `Store ${item.storeId}`,
            sales: item.sales,
            orders: item.orders,
          }
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10)

      setStoreSalesData(storeSales)
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...allOrders]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((order) => {
        const customerName = order.customer?.name || order.customer?.fullName || 'Unknown Customer'
        const cashierName = order.cashier?.fullName || order.cashier?.email || 'Unknown Cashier'
        const storeName = order.branch?.store?.brand || order.branch?.store?.name || ''
        return (
          customerName.toLowerCase().includes(query) ||
          cashierName.toLowerCase().includes(query) ||
          storeName.toLowerCase().includes(query)
        )
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Store filter
    if (storeFilter !== 'all') {
      filtered = filtered.filter((order) => {
        const storeId = order.branch?.store?.id || order.storeId
        return storeId?.toString() === storeFilter
      })
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
      return dateB - dateA
    })

    setFilteredOrders(filtered)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return format(date, 'MMM d, yyyy')
  }

  const getPaymentMethodLabel = (method) => {
    if (!method) return 'Cash'
    const methodMap = {
      CASH: 'Cash',
      CARD: 'Card',
      UPI: 'UPI',
      DEBIT_CARD: 'Debit Card',
      CREDIT_CARD: 'Credit Card',
    }
    return methodMap[method] || method
  }

  const getStatusLabel = (status) => {
    if (!status) return 'N/A'
    const statusMap = {
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-orange-100 text-orange-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const handleExport = () => {
    const headers = ['Date', 'Store', 'Customer', 'Cashier', 'Amount', 'Payment Method', 'Status']
    const rows = filteredOrders.map(order => [
      formatDate(order.createdAt),
      order.branch?.store?.brand || order.branch?.store?.name || 'Unknown',
      order.customer?.name || order.customer?.fullName || 'Unknown',
      order.cashier?.fullName || order.cashier?.email || 'Unknown',
      order.totalAmount || 0,
      getPaymentMethodLabel(order.paymentType),
      getStatusLabel(order.status),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `super-admin-sales-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">System-Wide Sales</h1>
          <p className="text-muted-foreground mt-1">View sales across all stores</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="size-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalSales)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-bold mt-1">{stats.ordersToday}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
                <p className="text-2xl font-bold mt-1">{stats.totalRefunds}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingUp className="size-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Sales</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.netSales)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="size-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
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

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="value" fill="#10b981" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Store Sales Comparison */}
      {storeSalesData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top Stores by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Sales</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.brand || store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="size-12 mx-auto mb-2 opacity-50" />
              <p>No sales found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {order.branch?.store?.brand || order.branch?.store?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer?.name || order.customer?.fullName || 'Unknown Customer'}
                      </TableCell>
                      <TableCell>
                        {order.cashier?.fullName || order.cashier?.email || 'Unknown Cashier'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount || 0)}
                      </TableCell>
                      <TableCell>{getPaymentMethodLabel(order.paymentType)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SuperAdminSalesPage

