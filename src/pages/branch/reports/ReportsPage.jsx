import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'

const ReportsPage = () => {
  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Generate and view branch reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Sales Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View detailed sales reports by date range, product, or category
            </p>
            <Button className="w-full" onClick={() => alert('Report generation feature coming soon!')}>
              <FileText className="size-4 mr-2" /> Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Daily Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Daily sales, orders, and transaction summary
            </p>
            <Button className="w-full" onClick={() => alert('Report generation feature coming soon!')}>
              <FileText className="size-4 mr-2" /> Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Inventory Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Stock levels, low stock items, and inventory movement
            </p>
            <Button className="w-full" onClick={() => alert('Report generation feature coming soon!')}>
              <FileText className="size-4 mr-2" /> Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Employee Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cashier performance, shift reports, and productivity metrics
            </p>
            <Button className="w-full" onClick={() => alert('Report generation feature coming soon!')}>
              <FileText className="size-4 mr-2" /> Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Customer Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Customer purchase history, loyalty, and revenue analysis
            </p>
            <Button className="w-full" onClick={() => alert('Report generation feature coming soon!')}>
              <FileText className="size-4 mr-2" /> Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Refund Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Refund trends, reasons, and financial impact analysis
            </p>
            <Button className="w-full" onClick={() => alert('Report generation feature coming soon!')}>
              <FileText className="size-4 mr-2" /> Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportsPage

