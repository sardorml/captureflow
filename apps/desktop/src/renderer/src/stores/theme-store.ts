import { create } from 'zustand'

type ThemeStore = {
  theme: 'dark'
}

// Always dark mode
document.documentElement.classList.add('dark')

export const useThemeStore = create<ThemeStore>(() => ({
  theme: 'dark'
}))
