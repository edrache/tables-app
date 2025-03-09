import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import plików tłumaczeń
import translationEN from './locales/en/translation.json'
import translationPL from './locales/pl/translation.json'

const resources = {
  en: {
    translation: translationEN
  },
  pl: {
    translation: translationPL
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // domyślny język
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false
    }
  })

i18n.on('languageChanged', (lng) => {
  console.log('Język zmieniony na:', lng)
  document.documentElement.lang = lng
})

export default i18n 