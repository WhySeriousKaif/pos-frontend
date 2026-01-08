import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const SalesSummery = ({ shiftData }) => {
  if (!shiftData) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Sales Summary</h2>
          <p className="text-sm text-muted-foreground">No sales data available</p>
        </CardContent>
      </Card>
    );
  }

  const totalOrders = shiftData.totalOrders || 0;
  const totalSales = shiftData.totalSales || 0;
  const totalRefunds = shiftData.totalRefunds || 0;
  const netSales = shiftData.netSale || (totalSales - totalRefunds);

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Sales Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Orders:</span>
            <span className="font-medium">{totalOrders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Sales:</span>
            <span className="font-medium">₹{totalSales.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Refunds:</span>
            <span className="font-medium text-destructive">-₹{totalRefunds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground font-semibold">Net Sales:</span>
            <span className="font-semibold">₹{netSales.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SalesSummery
