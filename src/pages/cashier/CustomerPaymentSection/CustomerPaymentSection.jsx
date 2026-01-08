import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
} from '@/components/ui/dialog'
import { useCart } from '@/contexts/CartContext'
import { customerAPI, orderAPI } from '@/services/api'
import { User, Tag, FileText, DollarSign, CreditCard, Pause } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const CustomerPaymentSection = () => {
  const {
    selectedCustomer,
    setSelectedCustomer,
    discount,
    setDiscount,
    orderNote,
    setOrderNote,
    cartItems,
    subtotal,
    discountAmount,
    total,
    clearCart,
  } = useCart()

  const [customers, setCustomers] = useState([])
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentType, setPaymentType] = useState('CASH')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isCustomerDialogOpen) {
      fetchCustomers()
    }
  }, [isCustomerDialogOpen, customerSearch])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = customerSearch.trim()
        ? await customerAPI.search(customerSearch)
        : await customerAPI.getAll()
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsCustomerDialogOpen(false)
    setCustomerSearch('')
  }

  const handleDiscountTypeChange = (type) => {
    setDiscount({ ...discount, type, value: 0 })
  }

  const handleProcessPayment = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty. Add products before processing payment.')
      return
    }

    try {
      setProcessing(true)
      setError(null)

      // Prepare order data
      const orderDto = {
        branchId: 1, // Default branch for testing
        cashierId: 1, // Default cashier for testing
        customerId: selectedCustomer?.id || null,
        paymentType: paymentType,
        status: 'COMPLETED',
        orderItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
      }

      // Create order
      const createdOrder = await orderAPI.create(orderDto)
      
      // Clear cart after successful order
      clearCart()
      
      // Show success message
      alert(`Order created successfully! Order ID: ${createdOrder.id}`)
      
    } catch (err) {
      console.error('Error processing payment:', err)
      setError('Failed to process payment: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className='w-full lg:w-1/5 flex flex-col bg-card gap-3 sm:gap-4 p-3 sm:p-4 min-h-0 overflow-y-auto'>
      {/* Customer Section */}
      <Card>
      <CardHeader className="p-2 pb-1">
          <CardTitle className='text-xs sm:text-sm flex items-center gap-2'>
            <User className='size-3 sm:size-4' />
            Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">          <Button
            variant='outline'
            className='w-full justify-start gap-2 text-xs sm:text-sm h-9 sm:h-10'
            onClick={() => setIsCustomerDialogOpen(true)}
          >
            <User className='size-3 sm:size-4' />
            <span className='truncate'>{selectedCustomer ? selectedCustomer.name : 'Select Customer'}</span>
          </Button>
          {selectedCustomer && (
            <div className='mt-2 text-[10px] sm:text-xs text-muted-foreground space-y-0.5'>
              <p className='truncate'>{selectedCustomer.email}</p>
              <p>{selectedCustomer.phone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount Section */}
      <Card>
      <CardHeader className="p-2 pb-1">
          <CardTitle className='text-xs sm:text-sm flex items-center gap-2'>
            <Tag className='size-3 sm:size-4' />
            Discount
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 sm:space-y-3 p-3 sm:p-4 pt-1 sm:pt-1.5'>
          <Input
            type='number'
            placeholder='Discount amount'
            value={discount.value || ''}
            onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
            min='0'
            className='h-9 sm:h-10 text-xs sm:text-sm'
          />
          <div className='flex gap-2'>
            <Button
              variant={discount.type === 'percentage' ? 'default' : 'outline'}
              size='sm'
              className='flex-1 h-8 sm:h-9 text-xs sm:text-sm'
              onClick={() => handleDiscountTypeChange('percentage')}
            >
              %
            </Button>
            <Button
              variant={discount.type === 'amount' ? 'default' : 'outline'}
              size='sm'
              className='flex-1 h-8 sm:h-9 text-xs sm:text-sm'
              onClick={() => handleDiscountTypeChange('amount')}
            >
              ₹
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Note Section */}
      <Card>
      <CardHeader className="p-3 pb-1">
          <CardTitle className='text-xs sm:text-sm  flex items-center gap-2 mb-0'>
            <FileText className='size-3 sm:size-4' />
            Order Note
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0.5">
          <Input
            placeholder='Add order note...'
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className='h-9 sm:h-10 text-xs sm:text-sm'
          />
        </CardContent>
      </Card>

      {/* Payment Type */}
      <Card>
      <CardHeader className="p-3 pb-1">
          <CardTitle className='text-xs sm:text-sm flex items-center gap-2'>
            <CreditCard className='size-3 sm:size-4' />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className='p-3 sm:p-4 pt-1 sm:pt-1.5'>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className='h-9 sm:h-10 text-xs sm:text-sm'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='CASH' className='text-xs sm:text-sm'>Cash</SelectItem>
              <SelectItem value='CARD' className='text-xs sm:text-sm'>Card</SelectItem>
              <SelectItem value='UPI' className='text-xs sm:text-sm'>UPI</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Total Amount */}
      <Card>
        <CardContent className='pt-4 sm:pt-6 p-3 sm:p-4'>
          <div className='text-center'>
            <div className='text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2'>
              ₹{total.toFixed(2)}
            </div>
            <p className='text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4'>Total Amount</p>
            {discountAmount > 0 && (
              <div className='text-[10px] sm:text-xs text-muted-foreground space-y-1 mb-3 sm:mb-4'>
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p className='text-destructive'>
                  Discount: -₹{discountAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className='space-y-2 shrink-0'>
        {error && (
          <div className='p-2 bg-destructive/10 text-destructive text-[10px] sm:text-xs rounded'>
            {error}
          </div>
        )}
        <Button
          className='w-full bg-primary text-primary-foreground h-10 sm:h-11 lg:h-12'
          onClick={handleProcessPayment}
          disabled={processing || cartItems.length === 0}
        >
          <CreditCard className='size-3 sm:size-4 mr-2' />
          <span className='text-xs sm:text-sm lg:text-base'>{processing ? 'Processing...' : 'Process Payment'}</span>
        </Button>
        <Button
          variant='outline'
          className='w-full h-10 sm:h-11 lg:h-12'
        >
          <Pause className='size-3 sm:size-4 mr-2' />
          <span className='text-xs sm:text-sm lg:text-base'>Hold Order</span>
        </Button>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className='max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-base sm:text-lg'>Select Customer</DialogTitle>
            <DialogDescription className='text-xs sm:text-sm'>
              Search and select a customer for this order
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3 sm:space-y-4'>
            <Input
              placeholder='Search customers...'
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className='h-9 sm:h-10 text-sm'
            />
            <Button
              variant='ghost'
              className='w-full justify-start h-9 sm:h-10 text-xs sm:text-sm'
              onClick={() => handleSelectCustomer(null)}
            >
              No Customer (Walk-in)
            </Button>
            {loading ? (
              <p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
                Loading...
              </p>
            ) : customers.length === 0 ? (
              <p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
                No customers found
              </p>
            ) : (
              <div className='max-h-[40vh] sm:max-h-60 overflow-y-auto space-y-2'>
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className='p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors'
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <p className='font-medium text-xs sm:text-sm'>{customer.name}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground truncate'>{customer.email}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>{customer.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomerPaymentSection
