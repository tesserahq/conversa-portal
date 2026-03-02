import { useFormContext } from './form-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/modules/shadcn/ui/form'
import Autocomplete, { type AutocompleteOption } from '@/modules/shadcn/ui/autocomplete'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shadcn/ui/tooltip'
import { CircleQuestionMark } from 'lucide-react'
import { cn } from '@shadcn/lib/utils'

interface FormAutocompleteProps {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  options: AutocompleteOption[]
  isLoading?: boolean
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSelect?: (option: AutocompleteOption) => void
  onSearchChange?: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  minLength?: number
  debounceMs?: number
  closeDelayMs?: number
  showSearchIcon?: boolean
  disabled?: boolean
  rules?: {
    required?: boolean | string
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormAutocomplete = ({
  field,
  label,
  description,
  required,
  hideError = false,
  rules,
  options,
  isLoading,
  defaultValue,
  onValueChange,
  onSelect,
  onSearchChange,
  placeholder,
  className,
  inputClassName,
  minLength,
  debounceMs,
  closeDelayMs,
  showSearchIcon,
  disabled,
}: FormAutocompleteProps) => {
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
            <div className="flex items-center gap-1">
              <FormLabel
                className={cn(
                  'mb-0',
                  required && 'after:text-destructive after:ml-0.5 after:content-["*"]'
                )}>
                {label}
              </FormLabel>
              {description && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer">
                      <CircleQuestionMark size={15} />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="end"
                      className="text-muted-foreground max-w-[500px]">
                      {description}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Autocomplete
              options={options}
              isLoading={isLoading}
              value={fieldProps.value ?? ''}
              defaultValue={defaultValue}
              onValueChange={(value) => {
                onValueChange?.(value)
                fieldProps.onChange(value)
              }}
              onSelect={onSelect}
              onSearchChange={onSearchChange}
              placeholder={placeholder}
              className={className}
              inputClassName={inputClassName}
              minLength={minLength}
              debounceMs={debounceMs}
              closeDelayMs={closeDelayMs}
              showSearchIcon={showSearchIcon}
              disabled={disabled}
            />
          </FormControl>
          {!hideError && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
