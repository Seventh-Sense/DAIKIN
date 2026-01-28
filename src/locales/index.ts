import { createI18n } from 'vue-i18n'
import cn from './lang/cn'
import en from './lang/en'
import jp from './lang/jp'

export type LocaleType = 'cn' | 'en' | 'jp'

// 导入所有语言包
const messages = {
  cn,
  en,
  jp
}

// 创建 i18n 实例
const createI18nInstance = (currentLocale: LocaleType) => {
  return createI18n({
    legacy: false, // 启用 Composition API 模式
    globalInjection: true, // 全局注入 $t 方法
    locale: currentLocale, // 默认语言（从 Pinia 获取）
    fallbackLocale: 'cn', // 回退语言
    messages
  })
}

export default createI18nInstance