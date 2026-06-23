import { create } from 'zustand'

type ThemeStore = {
  theme: 'dark'
}

document.documentElement.classList.add('dark')

export const useThemeStore = create<ThemeStore>(() => ({
  theme: 'dark'
}))
