import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const TopSellingItems = ({ topSellingProducts }) => {
  if (!topSellingProducts || topSellingProducts.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Top Selling Items</h2>
          <p className="text-sm text-muted-foreground">No products sold yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Top Selling Items</h2>
        <div className="space-y-3">
          {topSellingProducts.slice(0, 5).map((product, index) => (
            <div key={product.id || index} className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                  <span className="font-medium text-sm truncate">{product.name}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-6">
                  units sold: {product.quantity || 0}
                </div>
              </div>
              <div className="ml-2 text-sm font-semibold shrink-0">
                ₹{product.sellingPrice?.toFixed(2) || '0.00'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopSellingItems
