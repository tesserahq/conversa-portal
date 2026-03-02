import { useEffect, useState } from 'react'

type DebounceOptions = {
  minLength?: number
}

export function useDebouncedValue(value: string, delay = 300, options?: DebounceOptions) {
  const [debouncedValue, setDebouncedValue] = useState<string>(value)
  const minLength = options?.minLength ?? 0

  useEffect(() => {
    if (value.length === 0) {
      setDebouncedValue(value)
      return
    }

    if (value.length < minLength) {
      return
    }

    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timeout)
  }, [value, delay, minLength])

  return debouncedValue
}
