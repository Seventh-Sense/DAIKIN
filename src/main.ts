import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import svgIcon from "./icons/svgIcon.vue";

import router from "./router";

import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

import pinia from "./pinia";
import createI18nInstance, { LocaleType } from "./locales";
import { useLocaleStore } from "./pinia/modules/locale";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

const app = createApp(App);

app.use(pinia);

const localeStore = useLocaleStore();
localeStore.initLocale();

const currentLocale = localeStore.currentLocale as LocaleType;

const i18n = createI18nInstance(currentLocale);
declare global {
  interface Window {
    $i18n: typeof i18n;
  }
}
window.$i18n = i18n;

app.use(Antd);
app.use(router);
app.use(i18n);

app
  .component("svg-icon", svgIcon)
  .component("FontAwesomeIcon", FontAwesomeIcon)
  .mount("#app");
