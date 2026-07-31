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
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react'
import { orderAPI, refundAPI, userAPI } from '@/services/api'
import { format, startOfWeek, startOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
        setBranchId(1)
      }
    } catch (error) {
      console.error('Error fetching branch ID:', error)
      setBranchId(1)
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
      
      if (dateFilter === 'today' && branchId) {
        orders = await orderAPI.getTodayByBranch(branchId).catch(() => [])
      } else if (branchId) {
        const filters = {}
        if (paymentFilter !== 'all') filters.paymentType = paymentFilter
        orders = await orderAPI.getByBranch(branchId, filters).catch(() => [])
      } else {
        orders = await orderAPI.getAll().catch(() => [])
      }

      refunds = branchId ? await refundAPI.getByBranch(branchId).catch(() => []) : await refundAPI.getAll().catch(() => [])

      let filteredOrders = orders || []
      let filteredRefunds = refunds || []

      if (dateFilter === 'week') {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        filteredOrders = filteredOrders.filter(order => order.createdAt && new Date(order.createdAt) >= weekStart)
        filteredRefunds = filteredRefunds.filter(refund => 
          (refund.createdAt || refund.refundDate) && new Date(refund.createdAt || refund.refundDate) >= weekStart
        )
      } else if (dateFilter === 'month') {
        const monthStart = startOfMonth(new Date())
        filteredOrders = filteredOrders.filter(order => order.createdAt && new Date(order.createdAt) >= monthStart)
        filteredRefunds = filteredRefunds.filter(refund => 
          (refund.createdAt || refund.refundDate) && new Date(refund.createdAt || refund.refundDate) >= monthStart
        )
      }

      if (paymentFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.paymentType === paymentFilter)
        filteredRefunds = filteredRefunds.filter(refund => refund.paymentType === paymentFilter)
      }

      const allTransactions = [
        ...filteredOrders.map(order => ({
          id: `order-${order.id}`,
          type: 'SALE',
          orderId: order.id,
          refundId: null,
          date: order.createdAt,
          amount: order.totalAmount || 0,
          paymentType: order.paymentType || 'CASH',
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
          paymentType: refund.paymentType || 'CASH',
          customer: 'N/A',
          description: `Refund #${refund.id} - ${refund.reason || 'N/A'}`,
        })),
      ]

      let finalTransactions = allTransactions
      if (typeFilter !== 'all') {
        finalTransactions = finalTransactions.filter(t => t.type === typeFilter)
      }

      finalTransactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      setTransactions(finalTransactions)

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
      toast.error('Failed to load transactions')
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
        return <CreditCard className="size-3.5 text-blue-600" />
      case 'CASH':
        return <DollarSign className="size-3.5 text-emerald-600" />
      case 'UPI':
        return <Smartphone className="size-3.5 text-purple-600" />
      default:
        return <DollarSign className="size-3.5 text-slate-500" />
    }
  }

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions available to export')
      return
    }
    const headers = ['Type', 'ID', 'Date', 'Customer', 'Payment Type', 'Amount (INR)', 'Description']
    const rows = filteredTransactions.map(t => [
      t.type,
      t.orderId || t.refundId || '',
      t.date ? format(new Date(t.date), 'yyyy-MM-dd HH:mm') : '',
      `"${t.customer}"`,
      t.paymentType,
      t.amount,
      `"${t.description}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `branch_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Transactions CSV exported successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Branch Financial Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
              {filteredTransactions.length} Transactions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Audit income sales, refunds, payment breakdown, and export CSV logs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="size-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            className="text-xs font-bold border-slate-200 dark:border-slate-700 gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Refunds</p>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">₹{summary.totalRefunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
              <TrendingDown className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Cash Flow</p>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{summary.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <DollarSign className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Ledger Entries</p>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.transactionCount}</div>
            </div>
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Receipt className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search transaction ID or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today's Activity</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SALE">Sales (+)</SelectItem>
                <SelectItem value="REFUND">Refunds (-)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 space-y-2 flex-col">
              <div className="size-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading ledger entries...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CreditCard className="size-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Transactions Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">No ledger records match your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Type</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">ID Reference</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Date & Time</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300 text-right">Amount</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <TableCell>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1',
                            t.type === 'SALE' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          )}
                        >
                          {t.type === 'SALE' ? <ArrowUpRight className="size-3" /> : <ArrowDownLeft className="size-3" />}
                          {t.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-blue-600 dark:text-blue-400">#{t.orderId || t.refundId}</TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">{formatDateTime(t.date)}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.customer}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {getPaymentIcon(t.paymentType)}
                          {t.paymentType || 'CASH'}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right text-xs font-black',
                          t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        )}
                      >
                        {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">{t.description}</TableCell>
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


