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
import { Input } from '@/modules/shadcn/ui/input'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@shadcn/lib/utils'
import { useState } from 'react'

interface FormDateTimePickerProps {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  placeholder?: string
  dateFormat?: string
  timeFormat?: string
  disabled?: boolean
  rules?: {
    required?: boolean | string
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormDateTimePicker = ({
  field,
  label,
  description,
  required,
  hideError = false,
  placeholder = 'Pick a date and time',
  dateFormat = 'PPP',
  timeFormat = 'hh:mm',
  disabled = false,
  rules,
}: FormDateTimePickerProps) => {
  const { form } = useFormContext()
  const [isOpen, setIsOpen] = useState(false)

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
        const timeValue = dateValue ? format(dateValue, timeFormat) : ''

        const handleDateSelect = (date: Date | undefined) => {
          if (!date) {
            fieldProps.onChange('')
            return
          }

          // If time is already set, preserve it
          if (timeValue) {
            const [hours, minutes] = timeValue.split(':')
            date.setHours(parseInt(hours || '0', 10))
            date.setMinutes(parseInt(minutes || '0', 10))
          }

          fieldProps.onChange(date.toISOString())
          setIsOpen(false)
        }

        const handleTimeChange = (time: string) => {
          if (!time) {
            fieldProps.onChange('')
            return
          }

          const [hours, minutes] = time.split(':')
          const newDate = dateValue ? new Date(dateValue) : new Date()
          newDate.setHours(parseInt(hours || '0', 10))
          newDate.setMinutes(parseInt(minutes || '0', 10))
          newDate.setSeconds(0)
          newDate.setMilliseconds(0)

          fieldProps.onChange(newDate.toISOString())
        }

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
              <div className="flex gap-2">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start rounded text-left font-normal',
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
                      onSelect={handleDateSelect}
                      disabled={disabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="relative flex-1">
                  <Input
                    type="time"
                    value={timeValue}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="pl-9"
                    placeholder="Time"
                    disabled={disabled}
                  />
                </div>
              </div>
            </FormControl>
            {!hideError && <FormMessage />}
          </FormItem>
        )
      }}
    />
  )
}
