import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme(): {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
} {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('arnote-theme') as Theme | null
    return stored ?? 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (t: Theme): void => {
      if (t === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', systemDark)
        setResolvedTheme(systemDark ? 'dark' : 'light')
      } else {
        root.classList.toggle('dark', t === 'dark')
        setResolvedTheme(t)
      }
    }

    applyTheme(theme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (): void => applyTheme('system')
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }

    return undefined
  }, [theme])

  const setTheme = (newTheme: Theme): void => {
    localStorage.setItem('arnote-theme', newTheme)
    setThemeState(newTheme)
  }

  return { theme, setTheme, resolvedTheme }
}
