import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import tr from './locales/tr.json';
import id from './locales/id.json';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  id: { translation: id },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'boh_language',
    },
  });

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  tr: 'Turkish',
  id: 'Bahasa Indonesia',
};

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: 'EN',
  tr: 'TR',
  id: 'ID',
};

export default i18n;
