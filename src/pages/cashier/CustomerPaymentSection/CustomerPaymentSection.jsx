import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { customerAPI, orderAPI, paymentAPI } from '@/services/api'
import { User, Tag, FileText, CreditCard, UserPlus, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' })
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [addCustomerError, setAddCustomerError] = useState(null)

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
    setIsAddingCustomer(false)
    setNewCustomer({ name: '', email: '', phone: '' })
    setAddCustomerError(null)
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      setAddCustomerError('Name is required')
      return
    }
    try {
      setAddingCustomer(true)
      setAddCustomerError(null)
      const created = await customerAPI.create({
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim() || null,
        phone: newCustomer.phone.trim() || null,
      })
      handleSelectCustomer(created)
    } catch (err) {
      console.error('Error creating customer:', err)
      setAddCustomerError('Failed to add customer: ' + err.message)
    } finally {
      setAddingCustomer(false)
    }
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

      const orderData = {
        amount: total,
        currency: 'INR', // Or dynamic currency
      }


      if (paymentType === 'UPI' || paymentType === 'CARD') {
        // Create order on backend to get Razorpay Order ID
        const response = await paymentAPI.createOrder(orderData);
        const { id: order_id, currency, amount, key } = response;

        const options = {
          key: key || "rzp_test_MwXi3d9f7g1t8Z",
          amount: amount,
          currency: currency || "INR",
          name: "Bilix POS",
          description: paymentType === 'UPI' ? 'UPI Payment' : 'Card Payment',
          order_id: order_id,
          handler: async function (response) {
            await createBackendOrder(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          },
          prefill: {
            name: selectedCustomer?.name || selectedCustomer?.fullName || "Walk-in Customer",
            email: selectedCustomer?.email || "customer@molla.com",
            contact: selectedCustomer?.phone || "9876543210",
          },
          theme: {
            color: "#2563EB"
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
              setError("Payment Cancelled: Order was not placed.");
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          setError(`Payment Failed: ${response.error.description}`);
          setProcessing(false);
        });
        rzp1.open();
      } else {
        // Cash payment
        await createBackendOrder();
      }

    } catch (err) {
      console.error('Error processing payment:', err)
      setError('Failed to process payment: ' + err.message)
      setProcessing(false);
    }
  }

  const createBackendOrder = async (paymentId, razorpayOrderId, signature) => {
    try {
      // Prepare order data
      const orderDto = {
        branchId: 1, // Default branch 
        cashierId: 1, // Default cashier
        customerId: selectedCustomer?.id || null, // Allow null for walk-in
        paymentType: paymentType,
        status: 'COMPLETED',
        orderItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        // You might want to save payment details too
      }

      // Create order
      const createdOrder = await orderAPI.create(orderDto)

      // Clear cart after successful order
      clearCart()

      // Let the product grid know stock levels just changed so it can refetch live
      window.dispatchEvent(new CustomEvent('productsUpdated'))

      // Show success toast
      toast.success('Order placed successfully', {
        description: `Order #${createdOrder.id} · ₹${total.toFixed(2)}`,
      })
    } catch (err) {
      console.error('Error creating backend order:', err)
      setError('Payment successful but failed to create order: ' + err.message)
      toast.error('Failed to create order', { description: err.message })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className='shrink-0 flex flex-col gap-3 border-t border-slate-100 dark:border-white/5 max-h-[60%] overflow-y-auto'>
      <div className='p-4 sm:p-6 space-y-3'>
        {/* Customer */}
        <button
          onClick={() => setIsCustomerDialogOpen(true)}
          className='w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer text-left'
        >
          <div className='h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0'>
            <User className='size-4' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold text-slate-900 dark:text-white truncate'>
              {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>
              {selectedCustomer ? (selectedCustomer.email || selectedCustomer.phone || 'No contact info') : 'Tap to select a customer'}
            </p>
          </div>
        </button>

        {/* Discount */}
        <div className='rounded-2xl border border-slate-100 dark:border-white/5 p-3'>
          <div className='flex items-center gap-2 mb-2'>
            <Tag className='size-4 text-blue-600 dark:text-blue-400' />
            <span className='text-sm font-semibold text-slate-900 dark:text-white'>Discount</span>
          </div>
          <div className='flex gap-2'>
            <Input
              type='number'
              placeholder='0'
              value={discount.value || ''}
              onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
              min='0'
              className='h-9 text-sm rounded-full'
            />
            <Button
              variant={discount.type === 'percentage' ? 'default' : 'outline'}
              size='sm'
              className={cn('h-9 w-9 p-0 rounded-full', discount.type === 'percentage' && 'bg-blue-600 hover:bg-blue-700')}
              onClick={() => handleDiscountTypeChange('percentage')}
            >
              %
            </Button>
            <Button
              variant={discount.type === 'amount' ? 'default' : 'outline'}
              size='sm'
              className={cn('h-9 w-9 p-0 rounded-full', discount.type === 'amount' && 'bg-blue-600 hover:bg-blue-700')}
              onClick={() => handleDiscountTypeChange('amount')}
            >
              ₹
            </Button>
          </div>
        </div>

        {/* Order Note */}
        <div className='rounded-2xl border border-slate-100 dark:border-white/5 p-3'>
          <div className='flex items-center gap-2 mb-2'>
            <FileText className='size-4 text-blue-600 dark:text-blue-400' />
            <span className='text-sm font-semibold text-slate-900 dark:text-white'>Order Note</span>
          </div>
          <Input
            placeholder='Add order note...'
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className='h-9 text-sm rounded-full'
          />
        </div>

        {/* Payment Method */}
        <div className='rounded-2xl border border-slate-100 dark:border-white/5 p-3'>
          <div className='flex items-center gap-2 mb-2'>
            <CreditCard className='size-4 text-blue-600 dark:text-blue-400' />
            <span className='text-sm font-semibold text-slate-900 dark:text-white'>Payment Method</span>
          </div>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className='h-9 text-sm rounded-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='CASH' className='text-sm'>Cash</SelectItem>
              <SelectItem value='CARD' className='text-sm'>Card</SelectItem>
              <SelectItem value='UPI' className='text-sm'>UPI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Totals breakdown */}
        <div className='rounded-2xl bg-slate-50 dark:bg-white/5 p-4 space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-slate-500 dark:text-slate-400'>Sub-Total</span>
            <span className='font-semibold text-slate-900 dark:text-white'>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-slate-500 dark:text-slate-400'>Discount</span>
              <span className='font-semibold text-red-500'>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className='flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10'>
            <span className='font-semibold text-slate-900 dark:text-white'>Total Payment</span>
            <span className='text-xl font-black text-blue-600 dark:text-blue-400'>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className='shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 space-y-2'>
        {error && (
          <div className='p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-lg'>
            {error}
          </div>
        )}
        <Button
          className='w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-semibold text-base'
          onClick={handleProcessPayment}
          disabled={processing || cartItems.length === 0}
        >
          {processing ? 'Processing...' : 'Continue'}
        </Button>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog
        open={isCustomerDialogOpen}
        onOpenChange={(open) => {
          setIsCustomerDialogOpen(open)
          if (!open) {
            setIsAddingCustomer(false)
            setAddCustomerError(null)
          }
        }}
      >
        <DialogContent className='max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto'>
          {isAddingCustomer ? (
            <>
              <DialogHeader>
                <DialogTitle className='text-base sm:text-lg flex items-center gap-2'>
                  <button
                    onClick={() => setIsAddingCustomer(false)}
                    className='p-1 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer'
                  >
                    <ArrowLeft className='size-4' />
                  </button>
                  Add New Customer
                </DialogTitle>
                <DialogDescription className='text-xs sm:text-sm'>
                  Saved to your customer database — not hardcoded
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-3'>
                <Input
                  placeholder='Full name *'
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className='h-10 text-sm'
                />
                <Input
                  placeholder='Email'
                  type='email'
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className='h-10 text-sm'
                />
                <Input
                  placeholder='Phone'
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className='h-10 text-sm'
                />
                {addCustomerError && (
                  <p className='text-xs text-red-500'>{addCustomerError}</p>
                )}
                <Button
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-full'
                  onClick={handleCreateCustomer}
                  disabled={addingCustomer}
                >
                  {addingCustomer ? 'Saving...' : 'Save & Select Customer'}
                </Button>
              </div>
            </>
          ) : (
            <>
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
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    className='flex-1 justify-start h-9 sm:h-10 text-xs sm:text-sm'
                    onClick={() => handleSelectCustomer(null)}
                  >
                    No Customer (Walk-in)
                  </Button>
                  <Button
                    variant='outline'
                    className='gap-1.5 h-9 sm:h-10 text-xs sm:text-sm text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                    onClick={() => setIsAddingCustomer(true)}
                  >
                    <UserPlus className='size-3.5' />
                    Add New
                  </Button>
                </div>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomerPaymentSection
