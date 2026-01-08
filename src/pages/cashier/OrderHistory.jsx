import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Search, Eye, Printer, RotateCcw, CalendarIcon, Download, X } from 'lucide-react'
import { orderAPI } from '@/services/api'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { startOfToday, startOfWeek, startOfMonth, subDays, subMonths } from 'date-fns'

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('today') // today, week, month, custom
  const [customDateStart, setCustomDateStart] = useState(null)
  const [customDateEnd, setCustomDateEnd] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [branchId, setBranchId] = useState(1) // Default branch ID

  useEffect(() => {
    fetchOrders()
  }, [dateFilter, customDateStart, customDateEnd])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, orders])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let data = []
      
      if (dateFilter === 'today') {
        data = await orderAPI.getTodayByBranch(branchId)
      } else if (dateFilter === 'week') {
        // Get orders by branch and filter by week on frontend
        data = await orderAPI.getByBranch(branchId)
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
        data = data.filter(order => new Date(order.createdAt) >= weekStart)
      } else if (dateFilter === 'month') {
        // Get orders by branch and filter by month on frontend
        data = await orderAPI.getByBranch(branchId)
        const monthStart = startOfMonth(new Date())
        data = data.filter(order => new Date(order.createdAt) >= monthStart)
      } else if (dateFilter === 'custom' && customDateStart && customDateEnd) {
        // Get orders by branch and filter by custom date range
        data = await orderAPI.getByBranch(branchId)
        const start = new Date(customDateStart)
        const end = new Date(customDateEnd)
        end.setHours(23, 59, 59, 999) // Include entire end date
        data = data.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= start && orderDate <= end
        })
      } else {
        // Default: get all orders by branch
        data = await orderAPI.getByBranch(branchId)
      }
      
      // Sort by date descending (most recent first)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(data || [])
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
      // Handle both customer object and customer string (legacy)
      const customerName = typeof order.customer === 'string' 
        ? order.customer 
        : (order.customer?.name || order.customer?.fullName || 'Walk-in')
      const customerEmail = typeof order.customer === 'object' ? (order.customer?.email || '') : ''
      const customerPhone = typeof order.customer === 'object' ? (order.customer?.phone || '') : ''
      
      return (
        orderId.includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        customerPhone.includes(query)
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

  const handleRefundOrder = async (order) => {
    // TODO: Implement refund functionality
    if (confirm(`Do you want to process a refund for Order #${order.id}?`)) {
      console.log('Processing refund for order:', order.id)
      // Navigate to refund page or open refund dialog
    }
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    const date = new Date(dateTime)
    return format(date, 'MMM d, yyyy, h:mm a')
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 sm:p-6 border-b bg-card">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Order History</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Date Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('today')}
            >
              Today
            </Button>
            <Button
              variant={dateFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('week')}
            >
              This Week
            </Button>
            <Button
              variant={dateFilter === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('month')}
            >
              This Month
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFilter === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className={cn("gap-2", dateFilter === 'custom' && "bg-primary text-primary-foreground")}
                >
                  <CalendarIcon className="size-4" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Calendar
                      mode="single"
                      selected={customDateStart}
                      onSelect={(date) => {
                        setCustomDateStart(date)
                        if (date) setDateFilter('custom')
                      }}
                      initialFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Calendar
                      mode="single"
                      selected={customDateEnd}
                      onSelect={(date) => {
                        setCustomDateEnd(date)
                        if (date) setDateFilter('custom')
                      }}
                      initialFocus
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'No orders found matching your search' : 'No orders found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
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
                          {order.paymentType === 'CARD' && '💳'}
                          {order.paymentType === 'CASH' && '💵'}
                          {order.paymentType === 'UPI' && '📱'}
                          {order.paymentType || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          order.status === 'COMPLETED' && "bg-green-100 text-green-800",
                          order.status === 'PENDING' && "bg-yellow-100 text-yellow-800",
                          order.status === 'CANCELLED' && "bg-red-100 text-red-800",
                          !order.status && "bg-gray-100 text-gray-800"
                        )}>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRefundOrder(order)}
                            title="Refund Order"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" showCloseButton={false}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <DialogTitle className="text-2xl font-bold m-0">Order Details - {selectedOrder?.id}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsViewDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedOrder && (
            <div className="p-6 space-y-6">
              {/* Order Information and Customer Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium inline-block",
                            selectedOrder.status === 'COMPLETED' && "bg-green-100 text-green-800",
                            selectedOrder.status === 'PENDING' && "bg-yellow-100 text-yellow-800",
                            selectedOrder.status === 'CANCELLED' && "bg-red-100 text-red-800",
                            !selectedOrder.status && "bg-gray-100 text-gray-800"
                          )}>
                            {selectedOrder.status || 'N/A'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium">
                          <span className="inline-flex items-center gap-1">
                            {selectedOrder.paymentType === 'CARD' && '💳'}
                            {selectedOrder.paymentType === 'CASH' && '💵'}
                            {selectedOrder.paymentType === 'UPI' && '📱'}
                            {selectedOrder.paymentType || 'N/A'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium text-xl">₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {typeof selectedOrder.customer === 'string'
                            ? selectedOrder.customer
                            : (selectedOrder.customer?.name || selectedOrder.customer?.fullName || 'Walk-in')}
                        </p>
                      </div>
                      {typeof selectedOrder.customer === 'object' && selectedOrder.customer?.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedOrder.customer.phone}</p>
                        </div>
                      )}
                      {typeof selectedOrder.customer === 'object' && selectedOrder.customer?.email && (
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedOrder.customer.email}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Image</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                              {item.product?.image ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                  No Img
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product?.name || 'N/A'}</p>
                              {item.product?.sku && (
                                <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.price?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-initial gap-2"
                  onClick={() => {
                    // TODO: Implement PDF download
                    console.log('Download PDF for order:', selectedOrder.id)
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-initial gap-2"
                  onClick={() => handlePrintOrder(selectedOrder)}
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </Button>
                <Button
                  variant="default"
                  className="flex-1 sm:flex-initial gap-2 bg-destructive hover:bg-destructive/90"
                  onClick={() => handleRefundOrder(selectedOrder)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Initiate Return
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrderHistory

