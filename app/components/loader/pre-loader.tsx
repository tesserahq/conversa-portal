import { cn } from '@shadcn/lib/utils'

export function AppPreloader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'app-preloader bg-background grid h-full w-full place-content-center',
        className
      )}>
      <div className="app-preloader-inner relative inline-block size-48"></div>
    </div>
  )
}
