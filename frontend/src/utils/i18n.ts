import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/translations/en/global.json";
import fr from "@/translations/fr/global.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: "en",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
