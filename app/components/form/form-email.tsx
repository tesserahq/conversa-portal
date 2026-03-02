import { useFormContext } from 'react-hook-form'
import { Input } from '@shadcn/ui/input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shadcn/ui/form'
import { cn } from '@shadcn/lib/utils'

interface FormEmailProps {
  field: string
  label?: string
  description?: string
  required?: boolean | string
  placeholder?: string
  className?: string
  autoFocus?: boolean
  disabled?: boolean
}

export const FormEmail = ({
  field,
  label,
  description,
  required,
  placeholder = 'Enter email address',
  className,
  autoFocus,
  disabled,
}: FormEmailProps) => {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={field}
      rules={{
        ...(required && {
          required: required === true ? 'Email is required' : required,
        }),
        validate: (value: string | undefined) => {
          if (!value || value.trim() === '') {
            if (required) {
              return 'Email is required'
            }
            return true
          }
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailPattern.test(value)) {
            return 'Must have the @ sign and no spaces'
          }
          return true
        },
      }}
      render={({ field: fieldProps }) => (
        <FormItem>
          {label && (
            <FormLabel
              className={required ? 'after:text-destructive after:ml-0.5 after:content-["*"]' : ''}>
              {label}
            </FormLabel>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Input
              {...fieldProps}
              type="email"
              autoComplete="email"
              placeholder={placeholder}
              autoFocus={autoFocus}
              disabled={disabled}
              className={cn(form.formState.errors[field] && 'border-destructive', className)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
