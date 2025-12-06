import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'amber'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-700 text-zinc-300',
    success: 'bg-green-900/50 text-green-400 border border-green-700',
    warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
    danger: 'bg-red-900/50 text-red-400 border border-red-700',
    amber: 'bg-amber-500/20 text-amber-400 border border-amber-500/50',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
