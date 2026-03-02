import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shadcn/ui/card'
import React from 'react'

interface IProps {
  title: string
  children: React.ReactNode
}

export function FormLayout({ title, children }: IProps) {
  return (
    <div className="animate-slide-up mx-auto w-full max-w-screen-md">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </div>
  )
}
