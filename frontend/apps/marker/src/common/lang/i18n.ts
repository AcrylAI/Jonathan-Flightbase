import { initReactI18next } from 'react-i18next';

import { objParser } from '@jonathan/react-utils';

import en from './translations/en.json';
import ko from './translations/ko.json';

import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';

const parseEN = objParser().makeOneDepth(en, '.');
const parseKO = objParser().makeOneDepth(ko, '.');

const allowedLanguages = ['ko', 'en'];

let lng = 'ko';

type NavigatorLanguage = {
  language: string;
  userLanguage: string;
  systemLanguage: string;
};

// 처음에 브라우저 설정 언어 가져오기
const nav = navigator as unknown as NavigatorLanguage;
const browserLanguage = nav.language ?? nav.userLanguage ?? nav.systemLanguage;
if (browserLanguage !== null) {
  if (browserLanguage.toLowerCase().substring(0, 2) === 'ko') {
    lng = 'ko';
  } else {
    lng = 'en';
  }
}

// 언어 설정을 이미 한 경우
const storageLanguage = localStorage.getItem('language');
if (storageLanguage && allowedLanguages.indexOf(storageLanguage) > -1) {
  lng = storageLanguage;
}

i18n
  .use(initReactI18next)
  .use(Backend)
  .init({
    lng,
    resources: {
      en: {
        translation: parseEN,
      },
      ko: {
        translation: parseKO,
      },
    },
    fallbackLng: 'ko',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
