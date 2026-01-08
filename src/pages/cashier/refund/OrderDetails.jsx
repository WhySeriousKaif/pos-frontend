import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

const OrderDetails = ({ order, onBack }) => {
  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    const date = new Date(dateTime)
    return format(date, 'MMM d, yyyy, h:mm a')
  }

  if (!order) return null

  const totalItems = order.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={onBack}
        className="w-full justify-start"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Order Search
      </Button>

      {/* Order Information */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">Order {order.id}</h2>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Customer Information</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {typeof order.customer === 'string'
                  ? order.customer
                  : (order.customer?.name || order.customer?.fullName || 'Walk-in')}
              </p>
            </div>
            {typeof order.customer === 'object' && order.customer?.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold">Order Summary</h3>
            <span className="px-2 py-1 rounded text-xs font-medium bg-muted">
              {order.paymentType || 'N/A'}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Items:</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Order Total:</span>
              <span className="font-medium text-lg">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product?.name || 'N/A'}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{item.price?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-muted-foreground">
                        Total: ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderDetails

