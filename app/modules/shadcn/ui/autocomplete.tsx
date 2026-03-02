'use client'

import { useState, useEffect, useId, useRef } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Input } from '@shadcn/ui/input'
import { Button } from '@shadcn/ui/button'
import { Search } from 'lucide-react'

export type AutocompleteOption = {
  label: string
  value: string
  disabled?: boolean
}

interface AutoCompleteProps {
  options: AutocompleteOption[]
  isLoading?: boolean
  value?: string
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
}

export default function Autocomplete({
  options,
  isLoading = false,
  value,
  defaultValue = '',
  onValueChange,
  onSelect,
  onSearchChange,
  placeholder = 'Search...',
  className,
  inputClassName,
  minLength = 3,
  debounceMs = 300,
  closeDelayMs = 200,
  showSearchIcon = true,
  disabled = false,
}: AutoCompleteProps) {
  const listId = useId()
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [query, setQuery] = useState(value ?? defaultValue)
  const debouncedQuery = useDebouncedValue(query, debounceMs, {
    minLength,
  })
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!onSearchChange || !isFocused) {
      return
    }

    if (!debouncedQuery || debouncedQuery.length < minLength) {
      onSearchChange('')
      return
    }

    onSearchChange(debouncedQuery)
  }, [debouncedQuery, minLength, onSearchChange, query])

  useEffect(() => {
    if (!value) {
      setQuery(value ?? defaultValue)
      return
    }

    const matchedOption = options.find((option) => option.value === value)
    setQuery(matchedOption?.label ?? value)
  }, [value, defaultValue, options])

  useEffect(() => {
    if (query.length < minLength) {
      setSelectedIndex(-1)
    }
  }, [query, minLength])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onValueChange?.(newValue)
    setSelectedIndex(-1)
  }

  const selectOption = (option: AutocompleteOption) => {
    if (option.disabled) {
      return
    }
    setQuery(option.label)
    onValueChange?.(option.value)
    onSelect?.(option)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      selectOption(options[selectedIndex])
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1)
    }
  }

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    setIsFocused(true)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events on suggestions
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false)
      setSelectedIndex(-1)
    }, closeDelayMs)
  }

  return (
    <div className={`w-full ${className ?? ''}`.trim()}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`pr-10 ${inputClassName ?? ''}`.trim()}
          aria-label="Search input"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={options.length > 0}
          disabled={disabled}
        />
        {showSearchIcon && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full"
            aria-label="Search"
            disabled={disabled}>
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="absolute left-0 z-10 px-5 w-full">
        {isLoading && isFocused && (
          <div
            className="mt-2 p-3 w-full bg-background border rounded-md shadow-sm"
            aria-live="polite">
            Searcing...
          </div>
        )}
        {options.length > 0 && !isLoading && isFocused && (
          <ul
            id={listId}
            className="mt-2 bg-background border rounded-md shadow-sm max-h-[200px] overflow-y-auto"
            role="listbox">
            {options.map((option, index) => (
              <li
                key={`${option.value}-${index}`}
                className={[
                  'px-4 py-2 cursor-pointer hover:bg-muted',
                  index === selectedIndex ? 'bg-muted' : '',
                  option.disabled ? 'cursor-not-allowed opacity-50' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectOption(option)}
                role="option"
                aria-selected={index === selectedIndex}
                aria-disabled={option.disabled}>
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
