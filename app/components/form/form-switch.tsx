import { useFormContext } from './form-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/modules/shadcn/ui/form'
import { Switch } from '@/modules/shadcn/ui/switch'
import { ComponentProps } from 'react'

interface FormSwitchProps extends Omit<
  ComponentProps<typeof Switch>,
  'name' | 'checked' | 'onCheckedChange'
> {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  rules?: {
    required?: boolean | string
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormSwitch = ({
  field,
  label,
  description,
  required,
  hideError = false,
  rules,
  ...props
}: FormSwitchProps) => {
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
        <FormItem className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-0.5">
            {label && (
              <FormLabel
                className={
                  required ? 'after:text-destructive after:ml-0.5 after:content-["*"]' : ''
                }>
                {label}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              {...props}
              checked={fieldProps.value || false}
              onCheckedChange={fieldProps.onChange}
            />
          </FormControl>
          {!hideError && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
