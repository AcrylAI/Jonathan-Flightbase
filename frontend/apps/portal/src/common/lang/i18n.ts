import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { Korean, English } from '../../../public/locales';

const resources = {
  en: { translation: English },
  ko: { translation: Korean },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});
export default i18n;
