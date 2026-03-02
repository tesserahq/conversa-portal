import { Form } from './form'
import { FormProvider, useFormContext } from './form-context'
import { FormDatePicker } from './form-date-picker'
import { FormDateTimePicker } from './form-datetime-picker'
import { FormInput } from './form-input'
import { FormSelect } from './form-select'
import { FormSwitch } from './form-switch'
import { FormTextarea } from './form-textarea'
import { FormEmail } from './form-email'
import { FormCommand } from './form-command'
import { FormAutocomplete } from './form-autocomplete'

const FormCompound = Object.assign(Form, {
  Input: FormInput,
  Textarea: FormTextarea,
  Select: FormSelect,
  Switch: FormSwitch,
  DateTimePicker: FormDateTimePicker,
  DatePicker: FormDatePicker,
  Email: FormEmail,
  Command: FormCommand,
  Autocomplete: FormAutocomplete,
  Provider: FormProvider,
})

export { FormCompound as Form, useFormContext }
