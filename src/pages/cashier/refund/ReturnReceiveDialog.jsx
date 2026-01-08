import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

const ReturnReceiveDialog = ({ open, onClose, refund }) => {
  if (!refund) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-center">Return Processed Successfully</DialogTitle>
          <DialogDescription className="text-center">
            The refund has been processed for Order #{refund.orderId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Refund Amount:</span>
            <span className="font-semibold">₹{refund.amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Refund Method:</span>
            <span className="font-semibold">{refund.paymentType || 'N/A'}</span>
          </div>
          {refund.reason && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reason:</span>
              <span className="font-semibold text-right">{refund.reason}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={onClose} className="flex-1">
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReturnReceiveDialog

