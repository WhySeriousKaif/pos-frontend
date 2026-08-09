import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const ConfirmContext = createContext()

export const useConfirm = () => {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}

export const ConfirmProvider = ({ children }) => {
  const [options, setOptions] = useState(null)
  const resolveRef = useRef(null)

  // Replaces window.confirm(message) with a promise-based, styled dialog:
  //   const ok = await confirm({ title, description, variant: 'destructive' })
  const confirm = useCallback((opts) => {
    const normalized = typeof opts === 'string' ? { description: opts } : opts
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setOptions({
        title: 'Are you sure?',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        variant: 'default',
        ...normalized,
      })
    })
  }, [])

  const handleClose = (result) => {
    setOptions(null)
    resolveRef.current?.(result)
    resolveRef.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={!!options} onOpenChange={(open) => !open && handleClose(false)}>
        {options && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {options.variant === 'destructive' && (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                    <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                  </div>
                )}
                <DialogTitle>{options.title}</DialogTitle>
              </div>
              {options.description && (
                <DialogDescription>{options.description}</DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                {options.cancelLabel}
              </Button>
              <Button
                variant={options.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={() => handleClose(true)}
              >
                {options.confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  )
}
