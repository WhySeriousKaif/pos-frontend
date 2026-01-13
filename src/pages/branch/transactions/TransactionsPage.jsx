import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  RefreshCw,
  Download,
  CreditCard,
  DollarSign,
  Smartphone,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { orderAPI, refundAPI, userAPI } from '@/services/api'
import { format, startOfToday, startOfWeek, startOfMonth } from 'date-fns'

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [typeFilter, setTypeFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRefunds: 0,
    netAmount: 0,
    transactionCount: 0,
  })
  const [branchId, setBranchId] = useState(null)

  useEffect(() => {
    fetchBranchId()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchTransactions()
    }
  }, [branchId, dateFilter, typeFilter, paymentFilter])

  useEffect(() => {
    filterTransactions()
  }, [searchQuery, transactions])

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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    return format(new Date(dateTime), 'MMM d, yyyy, hh:mm a')
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      let orders = []
      let refunds = []
      
      if (dateFilter === 'today') {
        orders = await orderAPI.getTodayByBranch(branchId)
      } else {
        const filters = {}
        if (paymentFilter !== 'all') filters.paymentType = paymentFilter
        orders = await orderAPI.getByBranch(branchId, filters)
      }

      refunds = await refundAPI.getByBranch(branchId)

      // Filter by date range
      let filteredOrders = orders || []
      let filteredRefunds = refunds || []

      if (dateFilter === 'week') {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) >= weekStart)
        filteredRefunds = filteredRefunds.filter(refund => 
          new Date(refund.createdAt || refund.refundDate) >= weekStart
        )
      } else if (dateFilter === 'month') {
        const monthStart = startOfMonth(new Date())
        filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) >= monthStart)
        filteredRefunds = filteredRefunds.filter(refund => 
          new Date(refund.createdAt || refund.refundDate) >= monthStart
        )
      }

      // Filter by payment type
      if (paymentFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.paymentType === paymentFilter)
        filteredRefunds = filteredRefunds.filter(refund => refund.paymentType === paymentFilter)
      }

      // Combine and format transactions
      const allTransactions = [
        ...filteredOrders.map(order => ({
          id: `order-${order.id}`,
          type: 'SALE',
          orderId: order.id,
          refundId: null,
          date: order.createdAt,
          amount: order.totalAmount || 0,
          paymentType: order.paymentType,
          customer: typeof order.customer === 'string' 
            ? order.customer 
            : (order.customer?.name || order.customer?.fullName || 'Walk-in'),
          description: `Order #${order.id}`,
        })),
        ...filteredRefunds.map(refund => ({
          id: `refund-${refund.id}`,
          type: 'REFUND',
          orderId: refund.orderId,
          refundId: refund.id,
          date: refund.createdAt || refund.refundDate,
          amount: -(refund.amount || 0),
          paymentType: refund.paymentType,
          customer: 'N/A',
          description: `Refund #${refund.id} - ${refund.reason || 'N/A'}`,
        })),
      ]

      // Filter by type
      let finalTransactions = allTransactions
      if (typeFilter !== 'all') {
        finalTransactions = finalTransactions.filter(t => t.type === typeFilter)
      }

      finalTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      setTransactions(finalTransactions)

      // Calculate summary
      const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalRefunds = filteredRefunds.reduce((sum, refund) => sum + (refund.amount || 0), 0)
      
      setSummary({
        totalSales,
        totalRefunds,
        netAmount: totalSales - totalRefunds,
        transactionCount: finalTransactions.length,
      })
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = transactions.filter(transaction => {
      const id = transaction.orderId?.toString() || transaction.refundId?.toString() || ''
      const customer = transaction.customer?.toLowerCase() || ''
      const description = transaction.description?.toLowerCase() || ''

      return (
        id.includes(query) ||
        customer.includes(query) ||
        description.includes(query)
      )
    })
    setFilteredTransactions(filtered)
  }

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'CARD':
        return <CreditCard className="size-4" />
      case 'CASH':
        return <DollarSign className="size-4" />
      case 'UPI':
        return <Smartphone className="size-4" />
      default:
        return null
    }
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">View all sales and refund transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            <RefreshCw className="size-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{summary.totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <TrendingDown className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{summary.totalRefunds.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{summary.netAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.transactionCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SALE">Sales</SelectItem>
                <SelectItem value="REFUND">Refunds</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                {searchQuery ? 'No transactions found' : 'No transactions available'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'SALE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      #{transaction.orderId || transaction.refundId}
                    </TableCell>
                    <TableCell>{formatDateTime(transaction.date)}</TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        {getPaymentIcon(transaction.paymentType)}
                        {transaction.paymentType || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount >= 0 ? '+' : ''}
                      ₹{Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionsPage

