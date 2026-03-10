import { useFormContext } from './form-context'
import { FormField, FormItem, FormLabel, FormMessage } from '@/modules/shadcn/ui/form'
import { Input } from '@/modules/shadcn/ui/input'
import { Button } from '@shadcn/ui/button'
import { Badge } from '@/modules/shadcn/ui/badge'
import { CircleQuestionMark, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@shadcn/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shadcn/ui/tooltip'

export interface FormArrayProps {
  field: string
  label: string
  required?: boolean
  description?: string
  placeholder?: string
}

export function FormArray({ field, label, required, description, placeholder }: FormArrayProps) {
  const { form } = useFormContext()
  const [inputValue, setInputValue] = useState('')

  const values: string[] = (() => {
    const v = form.watch(field)
    return Array.isArray(v) ? v : []
  })()

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || values.includes(trimmed)) return
    form.setValue(field, [...values, trimmed], { shouldValidate: true })
    setInputValue('')
  }

  const handleRemove = (item: string) => {
    form.setValue(
      field,
      values.filter((v) => v !== item),
      { shouldValidate: true }
    )
  }

  return (
    <FormField
      control={form.control}
      name={field}
      rules={{
        ...(required && {
          validate: (v) => {
            const arr = Array.isArray(v) ? v : []
            return arr.length > 0 || `${label} is required`
          },
        }),
      }}
      render={() => (
        <FormItem>
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
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder ?? 'Enter a value'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAdd}
              disabled={!inputValue.trim()}>
              Add
            </Button>
          </div>
          {values.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {values.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="flex items-center gap-1 py-1.5 cursor-default">
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="cursor-pointer rounded-sm opacity-70 hover:opacity-100
                      focus:outline-none"
                    aria-label={`Remove ${item}`}>
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
