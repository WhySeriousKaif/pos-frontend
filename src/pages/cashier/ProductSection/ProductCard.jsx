import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ProductCard = ({ product, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <Card 
      className='cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col'
      onClick={handleClick}
    >
      <CardContent className='flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-3 lg:p-4 flex-1'>
        <div className='aspect-square bg-muted rounded-lg mb-1 sm:mb-2 flex items-center justify-center overflow-hidden'>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name || 'Product'} 
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='flex items-center justify-center h-full text-[10px] sm:text-xs text-muted-foreground px-2 text-center'>
              No Image
            </div>
          )}
          </div>
        <h3 className='font-medium text-xs sm:text-sm truncate'>{product.name || 'Unnamed Product'}</h3>
        <p className='text-[10px] sm:text-xs text-muted-foreground truncate'>{product.sku || 'N/A'}</p>
        <div className='flex items-center justify-between mt-auto gap-1 sm:gap-2 flex-wrap'>
          <span className='text-sm sm:text-base lg:text-lg font-semibold'>₹{product.sellingPrice?.toFixed(2) || '0.00'}</span>
          <Badge 
            className='text-[9px] sm:text-xs whitespace-nowrap' 
            variant='secondary'
          >
            {product.category?.name || 'Uncategorized'}
            {product.quantity !== undefined && product.quantity !== null && product.quantity > 0 && (
              <span className='ml-1'>
                ({product.quantity} in stock)
              </span>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard
