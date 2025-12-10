// components/doctor/delete-doctor-confirm.tsx
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
import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteDoctorConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctorName: string
  onConfirm: () => void
  isLoading?: boolean
}

export default function DeleteDoctorConfirm({
  open,
  onOpenChange,
  doctorName,
  onConfirm,
  isLoading = false,
}: DeleteDoctorConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-error" />
            <DialogTitle>Delete Doctor</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <span className="font-semibold">{doctorName}</span>? 
            This is a soft delete - the doctor will be marked as deleted but all their appointments 
            and patient data will be preserved in the database.
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
            variant="error"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Doctor
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}