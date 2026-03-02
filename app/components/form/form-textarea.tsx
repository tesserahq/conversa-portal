import { useFormContext } from './form-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/modules/shadcn/ui/form'
import { Textarea } from '@/modules/shadcn/ui/textarea'
import { ComponentProps } from 'react'

interface FormTextareaProps extends Omit<ComponentProps<typeof Textarea>, 'name'> {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  rules?: {
    required?: boolean | string
    minLength?: number | { value: number; message: string }
    maxLength?: number | { value: number; message: string }
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormTextarea = ({
  field,
  label,
  description,
  required,
  hideError = false,
  rules,
  ...props
}: FormTextareaProps) => {
  const { form } = useFormContext()

  return (
    <FormField
      control={form.control}
      name={field}
      rules={{
        ...rules,
        ...(required && {
          required: required === true ? 'This field is required' : required,
        }),
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
            <Textarea {...fieldProps} {...props} value={fieldProps.value || ''} />
          </FormControl>
          {!hideError && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
