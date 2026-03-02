import { useFormContext } from './form-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/modules/shadcn/ui/form'
import { Button } from '@/modules/shadcn/ui/button'
import { Calendar } from '@/modules/shadcn/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@shadcn/lib/utils'

interface FormDatePickerProps {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  placeholder?: string
  dateFormat?: string
  disabled?: boolean
  rules?: {
    required?: boolean | string
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormDatePicker = ({
  field,
  label,
  description,
  required,
  hideError = false,
  placeholder = 'Pick a date',
  dateFormat = 'PPP',
  disabled = false,
  rules,
}: FormDatePickerProps) => {
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
      render={({ field: fieldProps }) => {
        const dateValue = fieldProps.value ? new Date(fieldProps.value) : undefined

        return (
          <FormItem>
            {label && (
              <FormLabel
                className={
                  required ? 'after:text-destructive after:ml-0.5 after:content-["*"]' : ''
                }>
                {label}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateValue && 'text-muted-foreground'
                    )}
                    type="button">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? format(dateValue, dateFormat) : <span>{placeholder}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                      fieldProps.onChange(date ? date.toISOString() : '')
                    }}
                    disabled={disabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            {!hideError && <FormMessage />}
          </FormItem>
        )
      }}
    />
  )
}
