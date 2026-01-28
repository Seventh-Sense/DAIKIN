import { defineStore } from 'pinia'
import { ref } from 'vue'

// 主题类型
export type ThemeType = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  // 状态：当前主题（默认浅色）
  const currentTheme = ref<ThemeType>('light')

  // 初始化：从本地存储读取主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('admin-theme') as ThemeType | null
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      currentTheme.value = savedTheme
    }
    // 应用主题样式到 DOM
    applyTheme(currentTheme.value)
  }

  // 动作：切换主题
  const switchTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    localStorage.setItem('admin-theme', theme)
    applyTheme(theme)
  }

  // 辅助：应用主题到 DOM
  const applyTheme = (theme: ThemeType) => {
    const html = document.documentElement
    html.classList.remove('light-theme', 'dark-theme')
    html.classList.add(`${theme}-theme`)
  }

  return {
    currentTheme,
    initTheme,
    switchTheme
  }
})