import { Card, CardContent, CardHeader } from '@/modules/shadcn/ui/card'
import { cn } from '@shadcn/lib/utils'
import React from 'react'

interface IPageContentProps {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
  /** Applied to the outer wrapper — pass a height (e.g. `h-[calc(100vh-10rem)]`) to fill the screen. */
  className?: string
  /** Applied to the scrollable content area. */
  contentClassName?: string
}

export function DetailContent({
  title,
  actions,
  children,
  className,
  contentClassName,
}: IPageContentProps) {
  return (
    <div className={cn('animate-slide-up', className)}>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <h2 className="min-w-0 truncate text-xl font-semibold" title={title}>
              {title}
            </h2>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </CardHeader>
        <CardContent className={cn('min-h-0 flex-1 pt-0', contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
