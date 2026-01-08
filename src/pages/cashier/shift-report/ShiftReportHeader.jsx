import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer, ArrowRight } from 'lucide-react'

const ShiftReportHeader = ({ onPrint, onEndShift }) => {
  return (
    <div className='p-4 border-b bg-card'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Shift Summary</h1>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={onPrint}>
            <Printer className='size-4 mr-2' />
            Print Summary
          </Button>
          <Button variant='destructive' onClick={onEndShift}>
            <ArrowRight className='size-4 mr-2' />
            End Shift & Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ShiftReportHeader
