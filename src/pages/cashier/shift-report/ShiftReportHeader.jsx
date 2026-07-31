import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer, ArrowRight, Play } from 'lucide-react'

const ShiftReportHeader = ({ onPrint, onEndShift, onStartShift, shiftStarted }) => {
  return (
    <div className='p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Shift Summary</h1>
        <div className='flex items-center gap-2'>
          {!shiftStarted && (
            <Button variant='default' onClick={onStartShift} className="bg-green-600 hover:bg-green-700">
              <Play className='size-4 mr-2' />
              Start Shift
            </Button>
          )}
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
