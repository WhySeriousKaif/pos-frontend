import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check } from 'lucide-react'

const ReturnItemSection = ({ order, onProcessRefund, branchId, cashierId, shiftReportId }) => {
  const [returnItems, setReturnItems] = useState([])
  const [returnReason, setReturnReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('')

  useEffect(() => {
    if (order?.orderItems) {
      // Initialize return items with default values
      const items = order.orderItems.map(item => ({
        orderItemId: item.id,
        productId: item.product?.id,
        productName: item.product?.name || 'N/A',
        orderedQty: item.quantity || 0,
        returnQty: 0,
        price: item.price || 0,
        isReturning: false,
      }))
      setReturnItems(items)
    }
    
    // Set default refund method to original payment method
    if (order?.paymentType) {
      setRefundMethod(order.paymentType)
    }
  }, [order])

  const handleReturnQtyChange = (index, value) => {
    const qty = Math.max(0, Math.min(value, returnItems[index].orderedQty))
    const updated = [...returnItems]
    updated[index].returnQty = qty
    updated[index].isReturning = qty > 0
    setReturnItems(updated)
  }

  const toggleReturnItem = (index) => {
    const updated = [...returnItems]
    if (updated[index].isReturning) {
      updated[index].isReturning = false
      updated[index].returnQty = 0
    } else {
      updated[index].isReturning = true
      updated[index].returnQty = updated[index].orderedQty
    }
    setReturnItems(updated)
  }

  const calculateTotalRefund = () => {
    return returnItems.reduce((total, item) => {
      if (item.isReturning && item.returnQty > 0) {
        return total + (item.price * item.returnQty)
      }
      return total
    }, 0)
  }

  const totalRefund = calculateTotalRefund()
  const hasReturnItems = returnItems.some(item => item.isReturning && item.returnQty > 0)

  const handleProcessRefund = () => {
    if (!returnReason || !refundMethod) {
      alert('Please select return reason and refund method')
      return
    }

    if (!hasReturnItems) {
      alert('Please select at least one item to return')
      return
    }

    const refundData = {
      orderId: order.id,
      reason: returnReason,
      amount: totalRefund,
      paymentType: refundMethod,
      shiftReportId: shiftReportId || null,
      branch: branchId ? { id: branchId } : null,
      cashier: cashierId ? { id: cashierId } : null,
    }

    onProcessRefund(refundData, returnItems.filter(item => item.isReturning && item.returnQty > 0))
  }

  const returnReasons = [
    'Defective item',
    'Wrong item received',
    'Item damaged during shipping',
    'Customer changed mind',
    'Size/color mismatch',
    'Quality issues',
    'Other',
  ]

  if (!order) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Select an order to process return/refund</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Return Items Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Return Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-medium">Item</th>
                  <th className="text-center p-2 text-sm font-medium">Ordered</th>
                  <th className="text-center p-2 text-sm font-medium">Return Qty</th>
                  <th className="text-right p-2 text-sm font-medium">Refund Amount</th>
                  <th className="text-center p-2 text-sm font-medium">Return?</th>
                </tr>
              </thead>
              <tbody>
                {returnItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <p className="text-sm font-medium truncate max-w-[200px]">{item.productName}</p>
                    </td>
                    <td className="p-2 text-center text-sm">{item.orderedQty}</td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max={item.orderedQty}
                        value={item.returnQty}
                        onChange={(e) => handleReturnQtyChange(index, parseInt(e.target.value) || 0)}
                        className="w-20 mx-auto text-center"
                        disabled={!item.isReturning}
                      />
                    </td>
                    <td className="p-2 text-right text-sm">
                      {item.isReturning && item.returnQty > 0
                        ? `₹${(item.price * item.returnQty).toFixed(2)}`
                        : '-'}
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        variant={item.isReturning ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleReturnItem(index)}
                      >
                        {item.isReturning ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Yes
                          </>
                        ) : (
                          'No'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Return Reason */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Return Reason</h3>
          <Select value={returnReason} onValueChange={setReturnReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              {returnReasons.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Refund Method */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Refund Method</h3>
          <Select value={refundMethod} onValueChange={setRefundMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select refund method..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Total Refund Amount */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Refund Amount</span>
            <span className="text-2xl font-bold">₹{totalRefund.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Process Refund Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleProcessRefund}
        disabled={!hasReturnItems || !returnReason || !refundMethod}
      >
        Process Refund
      </Button>
    </div>
  )
}

export default ReturnItemSection

