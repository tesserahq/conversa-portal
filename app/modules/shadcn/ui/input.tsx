import * as React from 'react'

import { cn } from '@shadcn/lib/utils'
import { Button } from './button'
import { Eye, EyeOff } from 'lucide-react'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    const [fieldType, setFieldType] = React.useState<string>(type || 'text')

    return (
      <div className="relative w-full">
        <input
          type={fieldType}
          className={cn(
            `border-input ring-offset-background file:text-foreground
            placeholder:text-muted-foreground hover:border-primary focus-visible:ring-primary
            dark:text-primary-foreground flex h-10 w-full rounded border bg-transparent px-3 py-2
            text-base transition-all duration-100 file:border-0 file:bg-transparent file:text-sm
            file:font-medium placeholder:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2
            focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
            className
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && (
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => setFieldType(fieldType === 'text' ? 'password' : 'text')}
            className="absolute top-0 right-0 rounded hover:bg-transparent">
            {fieldType === 'text' ? <Eye /> : <EyeOff />}
          </Button>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
