import { cn } from '@shadcn/lib/utils'

interface IProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export default function Separator({ className, orientation = 'horizontal' }: IProps) {
  return (
    <div
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
    />
  )
}
