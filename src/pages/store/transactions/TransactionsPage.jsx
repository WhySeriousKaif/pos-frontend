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
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  Filter,
  CreditCard,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  orderAPI,
  refundAPI,
  branchAPI,
  storeAPI,
  userAPI,
} from '@/services/api'

const TransactionsPage = () => {
  const [storeId, setStoreId] = useState(null)
  const [branches, setBranches] = useState([])
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  
  // Statistics
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
  })

  useEffect(() => {
    fetchStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchTransactions()
    }
  }, [storeId])

  useEffect(() => {
    filterTransactions()
  }, [dateFilter, typeFilter, paymentMethodFilter, transactions])

  const fetchStoreId = async () => {
    try {
      const profile = await userAPI.getProfile()
      if (profile?.storeId) {
        setStoreId(profile.storeId)
      } else {
        const stores = await storeAPI.getByAdmin()
        if (stores && stores.length > 0) {
          setStoreId(stores[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching store ID:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      // Fetch branches
      const branchesData = await branchAPI.getByStoreId(storeId).catch(() => [])
      setBranches(branchesData)

      // Fetch orders and refunds from all branches
      const [ordersArrays, refundsArrays] = await Promise.all([
        Promise.all(
          branchesData.map(branch => orderAPI.getByBranch(branch.id).catch(() => []))
        ),
        Promise.all(
          branchesData.map(branch => refundAPI.getByBranch(branch.id).catch(() => []))
        ),
      ])

      const allOrders = ordersArrays.flat()
      const allRefunds = refundsArrays.flat()

      // Combine orders and refunds into transactions
      const transactionsList = []

      // Add orders as income transactions
      allOrders.forEach((order) => {
        transactionsList.push({
          id: `ORDER-${order.id}`,
          type: 'Sale',
          date: order.createdAt,
          reference: `TRX-${String(order.id).padStart(3, '0')}`,
          description: `Sale - Invoice INV-${String(order.id).padStart(3, '0')}`,
          amount: order.totalAmount || 0,
          paymentMethod: order.paymentType || 'CASH',
          status: order.status || 'COMPLETED',
          orderId: order.id,
          customer: order.customer,
          cashier: order.cashier,
          branch: order.branch,
        })
      })

      // Add refunds as expense transactions
      allRefunds.forEach((refund) => {
        transactionsList.push({
          id: `REFUND-${refund.id}`,
          type: 'Refund',
          date: refund.createdAt,
          reference: `TRX-REF-${String(refund.id).padStart(3, '0')}`,
          description: `Refund - Invoice INV-${String(refund.orderId || refund.id).padStart(3, '0')}${refund.reason ? ` (${refund.reason})` : ''}`,
          amount: refund.amount || 0,
          paymentMethod: refund.paymentType || 'CASH',
          status: 'COMPLETED',
          refundId: refund.id,
          orderId: refund.orderId,
          cashier: refund.cashier,
          branch: refund.branch,
        })
      })

      // Sort by date (newest first)
      transactionsList.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0)
        const dateB = b.date ? new Date(b.date) : new Date(0)
        return dateB - dateA
      })

      setTransactions(transactionsList)

      // Calculate statistics
      const totalIncome = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalExpenses = allRefunds.reduce((sum, refund) => sum + (refund.amount || 0), 0)
      const netAmount = totalIncome - totalExpenses

      setStats({
        totalIncome,
        totalExpenses,
        netAmount,
      })
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate = new Date()

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
        default:
          break
      }

      filtered = filtered.filter((transaction) => {
        if (!transaction.date) return false
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate <= now
      })
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((transaction) => transaction.type === typeFilter)
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter((transaction) => transaction.paymentMethod === paymentMethodFilter)
    }

    setFilteredTransactions(filtered)
  }

  const handleResetFilters = () => {
    setDateFilter('all')
    setTypeFilter('all')
    setPaymentMethodFilter('all')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return format(date, 'yyyy-MM-dd HH:mm')
  }

  const getPaymentMethodLabel = (method) => {
    if (!method) return 'N/A'
    const methodMap = {
      CASH: 'Cash',
      CARD: 'Credit Card',
      DEBIT_CARD: 'Debit Card',
      UPI: 'UPI',
    }
    return methodMap[method] || method
  }

  const getStatusColor = (status) => {
    const colorMap = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-orange-100 text-orange-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    if (!status) return 'N/A'
    const statusMap = {
      COMPLETED: 'Completed',
      PENDING: 'Pending',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded',
    }
    return statusMap[status] || status
  }

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date & Time', 'Reference', 'Type', 'Description', 'Amount', 'Payment Method', 'Status']
    const rows = filteredTransactions.map(transaction => [
      formatDateTime(transaction.date),
      transaction.reference,
      transaction.type,
      transaction.description,
      transaction.type === 'Sale' ? `+${formatCurrency(transaction.amount)}` : `-${formatCurrency(transaction.amount)}`,
      getPaymentMethodLabel(transaction.paymentMethod),
      getStatusLabel(transaction.status),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">View all financial transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalIncome)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalExpenses)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="size-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.netAmount)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Calendar className="size-4 mr-2" />
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
                <SelectItem value="Refund">Refund</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <CreditCard className="size-4 mr-2" />
                <SelectValue placeholder="All Payment Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Credit Card</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleResetFilters} className="flex-1 sm:flex-initial">
              <RefreshCw className="size-4 mr-2" />
              Reset Filters
            </Button>

            <Button onClick={handleExport} className="flex-1 sm:flex-initial">
              <Download className="size-4 mr-2" />
              Export Transactions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="size-12 mx-auto mb-2 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDateTime(transaction.date)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.reference}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.type === 'Sale'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="truncate">{transaction.description}</div>
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.type === 'Sale'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'Sale' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{getPaymentMethodLabel(transaction.paymentMethod)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {getStatusLabel(transaction.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            // View transaction details
                            const details = `Transaction Details\n\nReference: ${transaction.reference}\nType: ${transaction.type}\nDate: ${formatDateTime(transaction.date)}\nDescription: ${transaction.description}\nAmount: ${transaction.type === 'Sale' ? '+' : '-'}${formatCurrency(transaction.amount)}\nPayment Method: ${getPaymentMethodLabel(transaction.paymentMethod)}\nStatus: ${getStatusLabel(transaction.status)}`
                            alert(details)
                          }}
                          title="View Transaction Details"
                        >
                          <Eye className="size-4" />
                        </Button>
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

export default TransactionsPage

