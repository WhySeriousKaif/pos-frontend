import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

const CardSection = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  return (
    <div className='w-full lg:w-2/5 flex flex-col bg-card border-r border-border min-h-0'>
      <CardHeader className='border-b shrink-0 p-3 sm:p-4 lg:p-6'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <ShoppingCart className='size-4 sm:size-5' />
            <span>Cart ({cartItems.length} items)</span>
          </CardTitle>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' className='text-xs sm:text-sm'>
              <span className='hidden sm:inline'>Held </span>(0)
            </Button>
            <Button 
              variant='outline' 
              size='sm' 
              className='gap-1 sm:gap-2'
              onClick={clearCart}
              disabled={cartItems.length === 0}
            >
              <Trash2 className='size-3 sm:size-4' />
              <span className='hidden sm:inline'>Clear</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex-1 overflow-y-auto p-3 sm:p-4 min-h-0'>
        {cartItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-muted-foreground p-4'>
            <ShoppingCart className='size-16 sm:size-24 mb-3 sm:mb-4 opacity-20' />
            <p className='text-base sm:text-lg font-medium mb-2'>Cart is empty</p>
            <p className='text-xs sm:text-sm text-center'>Add products to start an order</p>
          </div>
        ) : (
          <div className='space-y-2 sm:space-y-3'>
            {cartItems.map((item) => (
              <div key={item.id} className='p-3 sm:p-4 border rounded-lg bg-background'>
                <div className='flex gap-2 sm:gap-3'>
                  <div className='w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg overflow-hidden shrink-0'>
                    {item.product.image ? (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground'>
                        No Img
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-xs sm:text-sm truncate'>{item.product.name}</h4>
                    <p className='text-[10px] sm:text-xs text-muted-foreground truncate'>{item.product.sku}</p>
                    <p className='text-xs sm:text-sm font-semibold mt-1'>₹{item.price.toFixed(2)}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-5 w-5 sm:h-6 sm:w-6 p-0 shrink-0'
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className='size-3 sm:size-4' />
                  </Button>
                </div>
                <div className='flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t gap-2'>
                  <div className='flex items-center gap-1 sm:gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className='size-3 sm:size-4' />
                    </Button>
                    <Input
                      type='number'
                      min='1'
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1;
                        updateQuantity(item.id, qty);
                      }}
                      className='w-12 sm:w-16 h-7 sm:h-8 text-center text-xs sm:text-sm'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 w-7 sm:h-8 sm:w-8 p-0'
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className='size-3 sm:size-4' />
                    </Button>
                  </div>
                  <p className='font-semibold text-xs sm:text-sm'>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  )
}

export default CardSection
