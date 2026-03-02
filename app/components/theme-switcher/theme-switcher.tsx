import type { Theme, ThemeExtended } from '@/hooks/useTheme'
import { useSubmit, useFetcher } from 'react-router'
import { Sun, Moon, Monitor } from 'lucide-react'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@shadcn/ui/select'
import { useOptimisticThemeMode } from '@/hooks/useTheme'

export function ThemeSwitcher({
  userPreference,
  triggerClass,
}: {
  userPreference?: Theme | null
  triggerClass?: string
}) {
  const submit = useSubmit()
  const optimisticMode = useOptimisticThemeMode()
  const mode = optimisticMode ?? userPreference ?? 'system'
  const themes: ThemeExtended[] = ['light', 'dark', 'system']

  return (
    <Select
      defaultValue={mode}
      onValueChange={(theme) =>
        submit(
          { theme },
          {
            method: 'POST',
            action: THEME_PATH,
            navigate: false,
            fetcherKey: 'theme-fetcher',
          }
        )
      }>
      <SelectTrigger className={triggerClass ?? ''}>
        <div className="flex items-center gap-2">
          {mode === 'light' ? (
            <Sun className="size-[14px]" />
          ) : mode === 'dark' ? (
            <Moon className="size-[14px]" />
          ) : (
            <Monitor className="size-[14px]" />
          )}
          <span className="text-sm font-medium">
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem
            key={theme}
            value={theme}
            className={`text-primary/60 text-sm font-medium ${mode === theme && 'text-primary'}`}>
            {theme && theme.charAt(0).toUpperCase() + theme.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ThemeSwitcherHome() {
  const fetcher = useFetcher({ key: 'theme-fetcher' })
  const themes: ThemeExtended[] = ['light', 'dark', 'system']

  return (
    <fetcher.Form method="POST" action={THEME_PATH} className="flex gap-3">
      {themes.map((theme) => (
        <button key={theme} type="submit" name="theme" value={theme}>
          {theme === 'light' ? (
            <Sun className="text-primary/80 hover:text-primary h-4 w-4" />
          ) : theme === 'dark' ? (
            <Moon className="text-primary/80 hover:text-primary h-4 w-4" />
          ) : (
            <Monitor className="text-primary/80 hover:text-primary h-4 w-4" />
          )}
        </button>
      ))}
    </fetcher.Form>
  )
}
