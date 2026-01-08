import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, Wallet, Banknote } from 'lucide-react'

const PaymentSummery = ({ paymentSummaries }) => {
  if (!paymentSummaries || paymentSummaries.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
          <p className="text-sm text-muted-foreground">No payment data available</p>
        </CardContent>
      </Card>
    );
  }

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'CARD':
        return <CreditCard className="size-4" />;
      case 'UPI':
        return <Wallet className="size-4" />;
      case 'CASH':
        return <Banknote className="size-4" />;
      default:
        return <CreditCard className="size-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
        <div className="space-y-3">
          {paymentSummaries.map((payment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPaymentIcon(payment.type)}
                <span className="font-medium">{payment.type}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">₹{payment.totalAmount?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-muted-foreground">
                  {payment.transactionCount || 0} transactions: {payment.percentage?.toFixed(1) || '0.0'}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentSummery
