// components/doctor/status-toggle-confirm.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface StatusToggleConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctorName: string
  currentStatus: boolean
  onConfirm: () => void
  isLoading?: boolean
}

export default function StatusToggleConfirm({
  open,
  onOpenChange,
  doctorName,
  currentStatus,
  onConfirm,
  isLoading = false,
}: StatusToggleConfirmProps) {
  const action = currentStatus ? 'disable' : 'enable'
  const title = currentStatus ? 'Disable Doctor' : 'Enable Doctor'
  
  const description = currentStatus 
    ? `Are you sure you want to disable ${doctorName}? Disabled doctors will not appear in booking page and cannot login.`
    : `Are you sure you want to enable ${doctorName}? Enabled doctors will appear in booking page and can login.`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {currentStatus ? (
              <AlertTriangle className="h-5 w-5 text-error" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={currentStatus ? "error" : "success"}
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Yes, ${action}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}