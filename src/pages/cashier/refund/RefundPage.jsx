import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { orderAPI, refundAPI, shiftReportAPI } from '@/services/api'
import OrderTable from './OrderTable'
import OrderDetails from './OrderDetails'
import ReturnItemSection from './ReturnItemSection'
import ReturnReceiveDialog from './ReturnReceiveDialog'

const RefundPage = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [branchId, setBranchId] = useState(1)
  const [cashierId, setCashierId] = useState(1)
  const [shiftReportId, setShiftReportId] = useState(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [processedRefund, setProcessedRefund] = useState(null)

  useEffect(() => {
    fetchOrders()
    fetchCurrentShift()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Fetch all orders by branch that can be returned
      const data = await orderAPI.getByBranch(branchId)
      // Filter out orders that have already been fully refunded (optional)
      // For now, show all orders
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentShift = async () => {
    try {
      const shift = await shiftReportAPI.getCurrent(cashierId)
      if (shift?.id) {
        setShiftReportId(shift.id)
      }
    } catch (error) {
      console.error('Error fetching shift:', error)
      // Continue without shift report ID
    }
  }

  const handleSelectOrder = (order) => {
    // Fetch full order details
    orderAPI.getById(order.id)
      .then(fullOrder => {
        setSelectedOrder(fullOrder)
      })
      .catch(error => {
        console.error('Error fetching order details:', error)
        setSelectedOrder(order)
      })
  }

  const handleBackToSearch = () => {
    setSelectedOrder(null)
  }

  const handleProcessRefund = async (refundData, returnItems) => {
    try {
      const refund = await refundAPI.create(refundData)
      setProcessedRefund(refund)
      setRefundDialogOpen(true)
      setSelectedOrder(null)
      // Refresh orders list
      fetchOrders()
    } catch (error) {
      console.error('Error processing refund:', error)
      alert(`Error processing refund: ${error.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b bg-card">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Return / Refund</h1>
        
        {!selectedOrder && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedOrder ? (
          /* Order Table View */
          <div className="h-full overflow-auto p-4 sm:p-6">
            <OrderTable
              orders={orders}
              searchQuery={searchQuery}
              onSelectOrder={handleSelectOrder}
              loading={loading}
            />
          </div>
        ) : (
          /* Order Details and Return Section */
          <div className="h-full overflow-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Order Details */}
              <div className="space-y-4">
                <OrderDetails
                  order={selectedOrder}
                  onBack={handleBackToSearch}
                />
              </div>

              {/* Right: Return Item Section */}
              <div className="space-y-4">
                <ReturnItemSection
                  order={selectedOrder}
                  onProcessRefund={handleProcessRefund}
                  branchId={branchId}
                  cashierId={cashierId}
                  shiftReportId={shiftReportId}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Refund Success Dialog */}
      <ReturnReceiveDialog
        open={refundDialogOpen}
        onClose={() => {
          setRefundDialogOpen(false)
          setProcessedRefund(null)
        }}
        refund={processedRefund}
      />
    </div>
  )
}

export default RefundPage

