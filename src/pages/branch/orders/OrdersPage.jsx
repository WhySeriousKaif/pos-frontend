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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Search,
  Eye,
  Printer,
  Filter,
  RefreshCw,
  CreditCard,
  DollarSign,
  Smartphone,
  X,
  ShoppingCart,
  Download,
  CheckCircle2,
  Clock,
  Ban,
  FileSpreadsheet,
} from 'lucide-react'
import { orderAPI, userAPI } from '@/services/api'
import { format, startOfWeek, startOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [branchId, setBranchId] = useState(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  useEffect(() => {
    fetchBranchId()
  }, [])

  useEffect(() => {
    if (branchId) {
      setCurrentPage(0)
      fetchOrders(0)
    }
  }, [branchId, dateFilter, statusFilter, paymentFilter])

  useEffect(() => {
    if (branchId) {
      fetchOrders(currentPage)
    }
  }, [currentPage])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, orders])

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

  const fetchOrders = async (page = 0) => {
    try {
      setLoading(true)
      let allOrders = []

      const isAllTime = dateFilter === 'all'
      const isNoFilters = statusFilter === 'all' && paymentFilter === 'all'

      if (isAllTime && isNoFilters && branchId) {
        const response = await orderAPI.getByBranchPaged(branchId, page, pageSize)
        allOrders = response.content || []
        setTotalPages(response.totalPages || 0)
        setTotalElements(response.totalElements || 0)
      } else {
        setTotalPages(0)

        if (dateFilter === 'today' && branchId) {
          allOrders = await orderAPI.getTodayByBranch(branchId).catch(() => [])
        } else if (branchId) {
          const filters = {}
          if (statusFilter !== 'all') filters.orderStatus = statusFilter
          if (paymentFilter !== 'all') filters.paymentType = paymentFilter
          allOrders = await orderAPI.getByBranch(branchId, filters).catch(() => [])
        } else {
          allOrders = await orderAPI.getAll().catch(() => [])
        }

        let filtered = allOrders || []
        if (dateFilter === 'week') {
          const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
          filtered = filtered.filter(order => order.createdAt && new Date(order.createdAt) >= weekStart)
        } else if (dateFilter === 'month') {
          const monthStart = startOfMonth(new Date())
          filtered = filtered.filter(order => order.createdAt && new Date(order.createdAt) >= monthStart)
        }

        if (!isAllTime) {
          if (statusFilter !== 'all' && dateFilter !== 'today') {
            filtered = filtered.filter(order => order.status === statusFilter)
          }
          if (paymentFilter !== 'all' && dateFilter !== 'today') {
            filtered = filtered.filter(order => order.paymentType === paymentFilter)
          }
        }

        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        allOrders = filtered
      }

      setOrders(allOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = orders.filter(order => {
      const orderId = order.id?.toString() || ''
      const customerName = typeof order.customer === 'string'
        ? order.customer
        : (order.customer?.name || order.customer?.fullName || 'Walk-in')

      return (
        orderId.includes(query) ||
        customerName.toLowerCase().includes(query)
      )
    })
    setFilteredOrders(filtered)
  }

  const handleViewOrder = async (orderId) => {
    try {
      const order = await orderAPI.getById(orderId)
      setSelectedOrder(order)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      const found = orders.find(o => o.id === orderId)
      if (found) {
        setSelectedOrder(found)
        setIsViewDialogOpen(true)
      } else {
        toast.error('Could not retrieve order details')
      }
    }
  }

  const handlePrintOrder = async (order) => {
    try {
      toast.info('Generating PDF receipt...')
      const { downloadInvoicePDF } = await import('@/utils/invoiceGenerator')
      downloadInvoicePDF(order)
      toast.success('Invoice generated successfully!')
    } catch (error) {
      console.error('Error generating PDF invoice:', error)
      toast.error('Failed to generate PDF invoice')
    }
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

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Branch Orders</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {filteredOrders.length} Orders
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage branch customer transactions, receipts, and order histories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={() => fetchOrders(currentPage)}
            className="text-sm font-bold border-slate-200 dark:border-slate-700 h-10 px-4 gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search order # or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today's Orders</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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

      {/* Orders Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-16 space-y-3 flex-col">
              <div className="size-9 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Loading branch orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <ShoppingCart className="size-14 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Orders Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">No orders match your selected filter options or search term.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                    <TableRow className="border-slate-100 dark:border-slate-800">
                      <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Order ID</TableHead>
                      <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Date & Time</TableHead>
                      <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Customer</TableHead>
                      <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-right">Amount</TableHead>
                      <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Payment</TableHead>
                      <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Status</TableHead>
                      <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <TableCell className="py-4 font-bold text-sm text-blue-600 dark:text-blue-400">#{order.id}</TableCell>
                        <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-300">{formatDateTime(order.createdAt)}</TableCell>
                        <TableCell className="py-4 text-sm font-bold text-slate-900 dark:text-white">
                          {typeof order.customer === 'string'
                            ? order.customer
                            : (order.customer?.name || order.customer?.fullName || 'Walk-in Customer')}
                        </TableCell>
                        <TableCell className="py-4 text-right text-sm font-black text-slate-900 dark:text-white">
                          ₹{order.totalAmount?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {getPaymentIcon(order.paymentType)}
                            {order.paymentType || 'CASH'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="size-3.5" />
                            {order.status || 'COMPLETED'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer"
                              onClick={() => handleViewOrder(order)}
                              title="View Details"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer"
                              onClick={() => handlePrintOrder(order)}
                              title="Print Receipt"
                            >
                              <Printer className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs text-slate-500">
                    Showing page <span className="font-bold">{currentPage + 1}</span> of <span className="font-bold">{totalPages}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="text-xs h-8"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="text-xs h-8"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Order #{selectedOrder?.id}</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedOrder?.createdAt ? formatDateTime(selectedOrder.createdAt) : 'Transaction Details'}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedOrder && handlePrintOrder(selectedOrder)}
              className="text-xs font-bold gap-1.5"
            >
              <Printer className="size-3.5" /> Download PDF
            </Button>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Customer</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {typeof selectedOrder.customer === 'string'
                      ? selectedOrder.customer
                      : (selectedOrder.customer?.name || selectedOrder.customer?.fullName || 'Walk-in Customer')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Payment Method</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedOrder.paymentType || 'CASH'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Status</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedOrder.status || 'COMPLETED'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Grand Total</span>
                  <p className="font-black text-sm text-slate-900 dark:text-white mt-0.5">₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Items Purchased</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
                      <TableRow>
                        <TableHead className="text-xs font-bold">Item</TableHead>
                        <TableHead className="text-xs font-bold text-right">Qty</TableHead>
                        <TableHead className="text-xs font-bold text-right">Price</TableHead>
                        <TableHead className="text-xs font-bold text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                        selectedOrder.orderItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.product?.name || item.name || 'Branch Product'}
                            </TableCell>
                            <TableCell className="text-xs text-right">{item.quantity || 1}</TableCell>
                            <TableCell className="text-xs text-right">₹{(item.price || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right font-bold">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-xs text-center p-4 text-slate-500">
                            Standard POS Sale Record
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrdersPage


