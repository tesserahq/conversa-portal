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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/modules/shadcn/ui/command'
import { Dialog, DialogContent } from '@/modules/shadcn/ui/dialog'
import { Button } from '@/modules/shadcn/ui/button'
import { CheckIcon, ChevronsUpDownIcon, CircleQuestionMark, Loader2 } from 'lucide-react'
import { ComponentProps, useState, type ReactNode } from 'react'
import { cn } from '@shadcn/lib/utils'
import { type DialogProps } from '@radix-ui/react-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shadcn/ui/tooltip'

export interface CommandOption {
  value: string
  label: string
  disabled?: boolean
  searchValue?: string
}

// Custom CommandDialog wrapper
interface CustomCommandDialogProps extends DialogProps {
  children: ReactNode
}

const CommandDialog = ({ children, ...dialogProps }: CustomCommandDialogProps) => {
  return (
    <Dialog {...dialogProps}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2
            [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2
            [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5
            [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2
            [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

interface CommandSelectProps {
  value?: string
  onChange: (value: string | undefined) => void
  options: CommandOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  isLoading?: boolean
  searchable?: boolean
  disabled?: boolean
  searchValue?: string
  onSearchChange?: (search: string) => void
  dialogProps?: Omit<
    ComponentProps<typeof CommandDialog>,
    'commandValue' | 'onCommandValueChange' | 'children'
  >
}

const CommandSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  isLoading = false,
  searchable = true,
  disabled = false,
  searchValue,
  onSearchChange,
  dialogProps,
}: CommandSelectProps) => {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (currentValue: string) => {
    if (currentValue) {
      const selected = options.find(
        (option) =>
          (option.searchValue ?? option.label).toLowerCase() === currentValue.toLowerCase()
      )

      if (selected) {
        onChange(selected.value === value ? undefined : selected.value)
      }

      setOpen(false)
    }
  }

  const handleSearchChange = (search: string) => {
    onSearchChange?.(search || '')
  }

  const commandInputProps: ComponentProps<typeof CommandInput> = {
    placeholder: searchPlaceholder,
    disabled: isLoading,
  }

  if (searchValue !== undefined) {
    commandInputProps.value = searchValue
  }

  if (onSearchChange) {
    commandInputProps.onValueChange = handleSearchChange
  }

  return (
    <>
      <Button
        variant="outline"
        role="combobox"
        type="button"
        aria-expanded={open}
        disabled={isLoading || disabled}
        onClick={() => setOpen(true)}
        className="w-full justify-between rounded bg-transparent">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : selectedOption ? (
          <span className="truncate">{selectedOption.label}</span>
        ) : (
          <span className="text-muted-foreground truncate">{placeholder}</span>
        )}
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} {...dialogProps}>
        {searchable && <CommandInput {...commandInputProps} />}
        <CommandList>
          {isLoading ? (
            <div className="flex justify-center items-center h-20 gap-2">
              <Loader2 size={15} className="animate animate-spin text-muted-foreground" />
              <span>Searching....</span>
            </div>
          ) : (
            <>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option, index) => {
                  const isSelected = value === option.value
                  const optionSearchValue = option.searchValue ?? option.label

                  return (
                    <CommandItem
                      key={`${option.value}-${index}`}
                      value={optionSearchValue}
                      disabled={option.disabled}
                      className={cn(
                        'dark:hover:bg-navy-300/20 cursor-pointer text-base hover:bg-slate-300/20',
                        isSelected && 'bg-accent',
                        option.disabled && 'cursor-not-allowed opacity-50'
                      )}
                      onSelect={handleSelect}>
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="truncate text-sm">{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

interface FormCommandProps extends Omit<ComponentProps<typeof CommandDialog>, 'children'> {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  options: CommandOption[]
  isLoading?: boolean
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (search: string) => void
  rules?: {
    required?: boolean | string
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormCommand = ({
  field,
  label,
  description,
  required,
  hideError = false,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  options,
  isLoading = false,
  searchable = true,
  searchValue,
  onSearchChange,
  rules,
  ...dialogProps
}: FormCommandProps) => {
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
            <CommandSelect
              value={fieldProps.value}
              onChange={fieldProps.onChange}
              options={options}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
              isLoading={isLoading}
              searchable={searchable}
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              dialogProps={dialogProps}
            />
          </FormControl>
          {!hideError && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
