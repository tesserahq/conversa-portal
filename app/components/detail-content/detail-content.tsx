import { Card, CardContent, CardHeader } from '@/modules/shadcn/ui/card'
import React from 'react'

interface IPageContentProps {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function DetailContent({ title, actions, children }: IPageContentProps) {
  return (
    <div className="animate-slide-up">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            {actions && <div>{actions}</div>}
          </div>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    </div>
  )
}
