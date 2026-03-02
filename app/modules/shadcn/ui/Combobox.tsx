'use client'

/**
 * Combobox Component
 *
 * A highly customizable, reusable combobox component built with Radix UI and shadcn/ui.
 * Supports custom rendering, search functionality, and flexible data handling.
 *
 * @module Combobox
 */

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { cn } from '@shadcn/lib/utils'
import { Button } from '@shadcn/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@shadcn/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Label } from './label'

/**
 * ComboboxOption Interface
 * @template T - Type of the data object attached to the option
 *
 * @property id - Unique identifier for the option (required)
 * @property label - Display text shown to the user (required)
 * @property value - The value returned when option is selected (required)
 * @property searchValue - Custom search text (optional, defaults to label)
 * @property data - Additional data object attached to the option (optional)
 * @property disabled - Whether the option is disabled (optional, defaults to false)
 */
export interface ComboboxOption<T = unknown> {
  id: string
  label: string
  value: string
  searchValue?: string
  data?: T
  disabled?: boolean
  [key: string]: unknown
}

/**
 * ComboboxProps Interface
 * @template T - Type of the data object in ComboboxOption
 *
 * @property options - Array of option objects to display
 * @property value - Currently selected value
 * @property placeholder - Placeholder text when nothing is selected (default: "Select option...)
 * @property searchPlaceholder - Placeholder text in search input (default: "Search...")
 * @property emptyText - Text shown when no results found (default: "No options found.")
 * @property onChange - Callback fired when selection changes (receives value and full option object)
 * @property renderOption - Custom render function for each option item in the dropdown
 * @property renderSelected - Custom render function for the selected value in the trigger button
 * @property renderTrigger - Custom render function for the entire trigger button (overrides renderSelected)
 * @property className - Additional CSS classes for the trigger button
 * @property disabled - Whether the combobox is disabled
 * @property onOpenChange - Callback fired when popover opens/closes
 */
export interface ComboboxProps<T = unknown> {
  options: ComboboxOption<T>[]
  value?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  onChange?: (value: string | undefined, option?: ComboboxOption<T>) => void
  onSearchChange?: (value: string) => void
  renderOption?: (option: ComboboxOption<T>) => React.ReactNode
  renderSelected?: (selectedOption?: ComboboxOption<T>) => React.ReactNode
  renderTrigger?: (selectedOption?: ComboboxOption<T>) => React.ReactNode
  className?: string
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  label?: string
  searchable?: boolean
}

/**
 * Combobox Component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Combobox
 *   options={[
 *     { id: '1', label: 'Option 1', value: 'opt1' },
 *     { id: '2', label: 'Option 2', value: 'opt2' }
 *   ]}
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom rendering for dropdown options
 * <Combobox
 *   options={options}
 *   value={selectedValue}
 *   onChange={(value, option) => console.log(value, option)}
 *   renderOption={(option) => (
 *     <div>
 *       <span>{option.label}</span>
 *       <span>{option.data?.description}</span>
 *     </div>
 *   )}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom selected value display
 * <Combobox
 *   options={options}
 *   value={selectedValue}
 *   onChange={(value) => setValue(value)}
 *   renderSelected={(selectedOption) => (
 *     <div className="flex items-center gap-2">
 *       {selectedOption?.data?.icon && <selectedOption.data.icon className="h-4 w-4" />}
 *       <span>{selectedOption?.label || 'Select an option'}</span>
 *     </div>
 *   )}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom search value
 * <Combobox
 *   options={[
 *     {
 *       id: '1',
 *       label: 'United States',
 *       value: 'US',
 *       searchValue: 'United States USA America'  // Search by multiple keywords
 *     }
 *   ]}
 *   value={selectedValue}
 *   onChange={(value) => setValue(value)}
 * />
 * ```
 */
export function Combobox<T = unknown>({
  options,
  value,
  placeholder = '',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  onChange,
  onSearchChange,
  renderOption,
  renderSelected,
  renderTrigger,
  className,
  disabled = false,
  onOpenChange,
  label,
  searchable = true,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen)
      onOpenChange?.(isOpen)
    },
    [onOpenChange]
  )

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const selected = options.find(
        (option) =>
          (option.searchValue ?? option.label).toLowerCase() === currentValue.toLowerCase()
      )

      if (selected) {
        onChange?.(selected.value === value ? undefined : selected.value, selected)
      }
      setOpen(false)
    },
    [options, value, onChange]
  )

  return (
    <div>
      {label && <Label className="mb-3">{label}</Label>}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {renderTrigger ? (
            <div>{renderTrigger(selectedOption)}</div>
          ) : (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn('w-full justify-between rounded bg-transparent', className)}>
              {selectedOption ? (
                renderSelected ? (
                  <div className="truncate">{renderSelected(selectedOption)}</div>
                ) : (
                  <span className="truncate">{selectedOption.label}</span>
                )
              ) : (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              )}
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className={cn('w-full p-0', !searchable && 'min-w-52')} align="start">
          <Command>
            {searchable && (
              <CommandInput
                placeholder={searchPlaceholder}
                disabled={disabled}
                onValueChange={onSearchChange}
              />
            )}
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value === option.value
                  const searchValue = option.searchValue ?? option.label
                  const OptionContent = renderOption ? (
                    renderOption(option)
                  ) : (
                    <span className="truncate">{option.label}</span>
                  )

                  return (
                    <CommandItem
                      key={option.id}
                      value={searchValue}
                      disabled={option.disabled}
                      className={cn(
                        `dark:hover:bg-navy-300/20 cursor-pointer text-base capitalize
                        hover:bg-slate-300/20`,
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
                      {OptionContent}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
