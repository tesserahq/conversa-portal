import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@shadcn/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:opacity-90',
        secondary:
          'border-transparent bg-secondary dark:bg-slate-600 text-secondary-foreground hover:opacity-90',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:opacity-90',
        outline: 'text-foreground',
        public: 'border-transparent bg-indigo-500 text-white shadow hover:opacity-90',
        private: 'border-transparent bg-slate-500 text-white shadow hover:opacity-90',
        active: 'border-transparent bg-green-500 text-white shadow hover:opacity-90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
