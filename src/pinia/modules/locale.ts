import { defineStore } from 'pinia'
import { ref } from 'vue'

export type LocaleType = 'cn' | 'en' | 'jp'

export const useLocaleStore = defineStore('locale', () => {
  // 状态：当前语言（默认中文）
  const currentLocale = ref<LocaleType>('cn')

  // 初始化：从本地存储读取语言
  const initLocale = () => {
    const savedLocale = localStorage.getItem('admin-locale') as LocaleType | null
    if (savedLocale && ['cn', 'en', 'jp'].includes(savedLocale)) {
      currentLocale.value = savedLocale
    }
  }

  // 动作：切换语言
  const switchLocale = (locale: LocaleType) => {
    currentLocale.value = locale
    localStorage.setItem('admin-locale', locale)
    
    const i18n = window.$i18n
    if (i18n) {
      i18n.global.locale.value = locale
    }
  }

  return {
    currentLocale,
    initLocale,
    switchLocale
  }
})