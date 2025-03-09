import { useTranslation } from 'react-i18next'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-2 py-1 text-sm rounded-md transition-colors ${
          i18n.language === 'en' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => i18n.changeLanguage('pl')}
        className={`px-2 py-1 text-sm rounded-md transition-colors ${
          i18n.language === 'pl' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        PL
      </button>
    </div>
  )
}

export default LanguageSwitcher 