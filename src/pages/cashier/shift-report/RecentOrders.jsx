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

const formatTime = (dateTime) => {
  if (!dateTime) return 'N/A';
  const date = new Date(dateTime);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const RecentOrders = ({ recentOrders }) => {
  if (!recentOrders || recentOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.slice(0, 10).map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{formatTime(order.createdAt)}</TableCell>
                <TableCell>{order.paymentType || 'N/A'}</TableCell>
                <TableCell className="text-right">₹{order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default RecentOrders
