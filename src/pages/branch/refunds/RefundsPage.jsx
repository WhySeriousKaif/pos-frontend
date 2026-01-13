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
  RefreshCw,
  RotateCcw,
  CalendarIcon,
  X,
} from 'lucide-react'
import { refundAPI, orderAPI, userAPI } from '@/services/api'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const RefundsPage = () => {
  const [refunds, setRefunds] = useState([])
  const [filteredRefunds, setFilteredRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [branchId, setBranchId] = useState(null)

  useEffect(() => {
    fetchBranchId()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchRefunds()
    }
  }, [branchId])

  useEffect(() => {
    filterRefunds()
  }, [searchQuery, refunds])

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

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      const data = await refundAPI.getByBranch(branchId)
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt || b.refundDate) - new Date(a.createdAt || a.refundDate))
      setRefunds(sorted)
    } catch (error) {
      console.error('Error fetching refunds:', error)
      setRefunds([])
    } finally {
      setLoading(false)
    }
  }

  const filterRefunds = () => {
    if (!searchQuery.trim()) {
      setFilteredRefunds(refunds)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = refunds.filter(refund => {
      const refundId = refund.id?.toString() || ''
      const orderId = refund.orderId?.toString() || ''
      const reason = refund.reason?.toLowerCase() || ''

      return (
        refundId.includes(query) ||
        orderId.includes(query) ||
        reason.includes(query)
      )
    })
    setFilteredRefunds(filtered)
  }

  const handleViewRefund = async (refund) => {
    try {
      // Fetch order details if available
      let order = null
      if (refund.orderId) {
        try {
          order = await orderAPI.getById(refund.orderId)
        } catch (err) {
          console.error('Error fetching order:', err)
        }
      }
      setSelectedRefund({ ...refund, order })
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Error fetching refund details:', error)
    }
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Refunds</h1>
          <p className="text-muted-foreground mt-1">Manage and view all refunds</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRefunds}>
          <RefreshCw className="size-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by refund ID, order ID, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                {searchQuery ? 'No refunds found matching your search' : 'No refunds available'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">#{refund.id}</TableCell>
                    <TableCell>#{refund.orderId || 'N/A'}</TableCell>
                    <TableCell>{formatDateTime(refund.createdAt || refund.refundDate)}</TableCell>
                    <TableCell className="max-w-xs truncate">{refund.reason || 'N/A'}</TableCell>
                    <TableCell>{refund.paymentType || 'N/A'}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      ₹{refund.amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {refund.cashier?.fullName || refund.cashier?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewRefund(refund)}
                        title="View Details"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Refund Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Refund Details #{selectedRefund?.id || ''}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {selectedRefund ? formatDateTime(selectedRefund.createdAt || selectedRefund.refundDate) : 'Refund details'}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          {selectedRefund && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Refund Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Refund ID:</strong> #{selectedRefund.id}</p>
                    <p><strong>Order ID:</strong> #{selectedRefund.orderId || 'N/A'}</p>
                    <p><strong>Date:</strong> {formatDateTime(selectedRefund.createdAt || selectedRefund.refundDate)}</p>
                    <p><strong>Payment Method:</strong> {selectedRefund.paymentType || 'N/A'}</p>
                    <p className="text-lg font-bold mt-2 text-red-600">
                      <strong>Amount:</strong> ₹{selectedRefund.amount?.toFixed(2) || '0.00'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Reason:</strong></p>
                    <p className="text-muted-foreground">{selectedRefund.reason || 'N/A'}</p>
                    <p className="mt-2"><strong>Cashier:</strong></p>
                    <p>{selectedRefund.cashier?.fullName || selectedRefund.cashier?.name || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>

              {selectedRefund.order && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Original Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Order Date:</strong> {formatDateTime(selectedRefund.order.createdAt)}</p>
                    <p><strong>Order Total:</strong> ₹{selectedRefund.order.totalAmount?.toFixed(2) || '0.00'}</p>
                    <p><strong>Customer:</strong>{' '}
                      {typeof selectedRefund.order.customer === 'string'
                        ? selectedRefund.order.customer
                        : (selectedRefund.order.customer?.name || selectedRefund.order.customer?.fullName || 'Walk-in')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RefundsPage

