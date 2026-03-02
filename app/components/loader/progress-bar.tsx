import { cn } from '@shadcn/lib/utils'
import { useNavigation } from 'react-router'
import { useEffect, useRef, useState } from 'react'

export function ProgressBar() {
  const navigation = useNavigation()
  const active = navigation.state !== 'idle'

  const ref = useRef<HTMLDivElement>(null)
  const [animationComplete, setAnimationComplete] = useState(true)

  useEffect(() => {
    if (!ref.current) return
    if (active) setAnimationComplete(false)

    Promise.allSettled(ref.current.getAnimations().map(({ finished }) => finished)).then(
      () => !active && setAnimationComplete(true)
    )
  }, [active])

  return (
    <div
      role="progressbar"
      aria-valuetext={active ? 'Loading' : undefined}
      aria-hidden={!active}
      className="fixed inset-x-0 top-0 left-0 z-[1000] h-1 animate-pulse">
      <div
        ref={ref}
        className={cn(
          'h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-in-out',
          navigation.state === 'idle' && animationComplete && 'w-0 opacity-0 transition-none',
          navigation.state === 'submitting' && 'w-4/12',
          navigation.state === 'loading' && 'w-10/12',
          navigation.state === 'idle' && !animationComplete && 'w-full'
        )}
      />
    </div>
  )
}
