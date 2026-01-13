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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Search,
  Eye,
  Printer,
  CalendarIcon,
  Filter,
  Download,
  RefreshCw,
  CreditCard,
  DollarSign,
  Smartphone,
  X,
} from 'lucide-react'
import { orderAPI, userAPI } from '@/services/api'
import { format, startOfToday, startOfWeek, startOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'

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
  const [branchId, setBranchId] = useState(null) // Start with null instead of hardcoded 1

  useEffect(() => {
    fetchBranchId()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchOrders()
    }
  }, [branchId, dateFilter, statusFilter, paymentFilter])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, orders])

  const fetchBranchId = async () => {
    try {
      const profile = await userAPI.getProfile()
      if (profile?.branchId) {
        setBranchId(profile.branchId)
      }
    } catch (error) {
      console.error('Error fetching branch ID:', error)
    }
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    return format(new Date(dateTime), 'MMM d, yyyy, hh:mm a')
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let allOrders = []
      
      if (dateFilter === 'today') {
        allOrders = await orderAPI.getTodayByBranch(branchId)
      } else {
        const filters = {}
        if (statusFilter !== 'all') filters.orderStatus = statusFilter
        if (paymentFilter !== 'all') filters.paymentType = paymentFilter
        allOrders = await orderAPI.getByBranch(branchId, filters)
      }

      // Additional client-side filtering for date ranges
      let filtered = allOrders || []
      if (dateFilter === 'week') {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        filtered = filtered.filter(order => new Date(order.createdAt) >= weekStart)
      } else if (dateFilter === 'month') {
        const monthStart = startOfMonth(new Date())
        filtered = filtered.filter(order => new Date(order.createdAt) >= monthStart)
      }

      // Additional status and payment filtering if needed
      if (statusFilter !== 'all' && dateFilter !== 'today') {
        filtered = filtered.filter(order => order.status === statusFilter)
      }
      if (paymentFilter !== 'all' && dateFilter !== 'today') {
        filtered = filtered.filter(order => order.paymentType === paymentFilter)
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(filtered)
    } catch (error) {
      console.error('Error fetching orders:', error)
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
      const customerEmail = typeof order.customer === 'object' ? (order.customer?.email || '') : ''
      const customerPhone = typeof order.customer === 'object' ? (order.customer?.phone || '') : ''

      return (
        orderId.includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        customerPhone.toLowerCase().includes(query)
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
    }
  }

  const handlePrintOrder = async (order) => {
    // Generate and download PDF invoice
    try {
      const { downloadInvoicePDF } = await import('@/utils/invoiceGenerator')
      downloadInvoicePDF(order)
    } catch (error) {
      console.error('Error generating PDF invoice:', error)
      alert('Failed to generate invoice. Please try again.')
    }
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
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and view all branch orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="size-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="size-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search orders..."
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                {searchQuery ? 'No orders found matching your search' : 'No orders available'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      {typeof order.customer === 'string'
                        ? order.customer
                        : (order.customer?.name || order.customer?.fullName || 'Walk-in')}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        {getPaymentIcon(order.paymentType)}
                        {order.paymentType || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          order.status === 'COMPLETED' && 'bg-green-100 text-green-800',
                          order.status === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                          order.status === 'CANCELLED' && 'bg-red-100 text-red-800',
                          !order.status && 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {order.status || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewOrder(order.id)}
                          title="View Order"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handlePrintOrder(order)}
                          title="Print Order"
                        >
                          <Printer className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Order Details #{selectedOrder?.id}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {formatDateTime(selectedOrder?.createdAt)}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          {selectedOrder && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Date:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                    <p><strong>Status:</strong>
                      <span
                        className={cn(
                          'ml-2 px-2 py-1 rounded text-xs font-medium',
                          selectedOrder.status === 'COMPLETED' && 'bg-green-100 text-green-800',
                          selectedOrder.status === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                          selectedOrder.status === 'CANCELLED' && 'bg-red-100 text-red-800'
                        )}
                      >
                        {selectedOrder.status || 'N/A'}
                      </span>
                    </p>
                    <p><strong>Payment:</strong> {selectedOrder.paymentType || 'N/A'}</p>
                    <p className="text-lg font-bold mt-2">
                      <strong>Total:</strong> ₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Name:</strong>{' '}
                      {typeof selectedOrder.customer === 'string'
                        ? selectedOrder.customer
                        : (selectedOrder.customer?.name || selectedOrder.customer?.fullName || 'Walk-in')}
                    </p>
                    {typeof selectedOrder.customer === 'object' && selectedOrder.customer?.phone && (
                      <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                    )}
                    {typeof selectedOrder.customer === 'object' && selectedOrder.customer?.email && (
                      <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <p className="font-medium">{item.product?.name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">SKU: {item.product?.sku || 'N/A'}</p>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.price?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell className="text-right">
                            ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrdersPage

