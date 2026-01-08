import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const RefundsTable = ({ refunds }) => {
  if (!refunds || refunds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refunds Processed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No refunds processed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refunds Processed</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Refund ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.slice(0, 10).map((refund) => (
              <TableRow key={refund.id}>
                <TableCell className="font-medium">#{refund.id}</TableCell>
                <TableCell>#{refund.orderId || refund.order?.id || 'N/A'}</TableCell>
                <TableCell className="max-w-[200px] truncate">{refund.reason || 'N/A'}</TableCell>
                <TableCell className="text-right text-destructive">-₹{refund.amount?.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default RefundsTable