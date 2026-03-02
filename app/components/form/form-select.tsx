import { useFormContext } from './form-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/modules/shadcn/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shadcn/ui/select'
import { Loader2 } from 'lucide-react'
import { ComponentProps } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps extends Omit<
  ComponentProps<typeof Select>,
  'name' | 'value' | 'onValueChange'
> {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  placeholder?: string
  options: SelectOption[]
  isLoading?: boolean
  rules?: {
    required?: boolean | string
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormSelect = ({
  field,
  label,
  description,
  required,
  hideError = false,
  placeholder = 'Select an option',
  options,
  isLoading = false,
  rules,
  ...props
}: FormSelectProps) => {
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
            <Select
              value={fieldProps.value}
              onValueChange={fieldProps.onChange}
              disabled={isLoading || props.disabled}
              {...props}>
              <SelectTrigger>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue placeholder={placeholder} />
                )}
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {!hideError && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
