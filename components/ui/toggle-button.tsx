// components/ui/toggle-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface ToggleButtonProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ToggleButton({
  checked,
  onCheckedChange,
  disabled = false,
  loading = false,
  size = 'md',
  className,
}: ToggleButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-16 text-xs',
    md: 'h-10 w-20 text-sm',
    lg: 'h-12 w-24 text-base',
  }

  return (
    <Button
      type="button"
      variant={checked ? "success" : "secondary"}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled || loading}
      className={cn(
        "relative transition-all duration-200 font-medium px-0",
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          <span className={cn(
            "absolute left-2 transition-opacity duration-200",
            checked ? "opacity-0" : "opacity-100"
          )}>
            <X className="h-4 w-4" />
          </span>
          <span className={cn(
            "transition-all duration-200",
            checked ? "translate-x-2" : "translate-x-8"
          )}>
            {checked ? 'ON' : 'OFF'}
          </span>
          <span className={cn(
            "absolute right-2 transition-opacity duration-200",
            checked ? "opacity-100" : "opacity-0"
          )}>
            <Check className="h-4 w-4" />
          </span>
        </>
      )}
    </Button>
  )
}