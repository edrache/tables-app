import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          {t('home.title')}
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{t('home.tables.title')}</h3>
              <p className="mt-4 text-base text-gray-500">{t('home.tables.description')}</p>
              <ul className="mt-6 space-y-4">
                {['feature1', 'feature2', 'feature3'].map((feature) => (
                  <li key={feature} className="flex">
                    <span className="text-green-500">✓</span>
                    <span className="ml-3 text-base text-gray-500">{t(`home.tables.${feature}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <Link
                to="/tables"
                className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-5 inline-flex items-center justify-center text-base font-medium text-white hover:bg-primary-700"
              >
                {t('home.tables.create')}
              </Link>
            </div>
          </div>

          <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{t('home.pages.title')}</h3>
              <p className="mt-4 text-base text-gray-500">{t('home.pages.description')}</p>
              <ul className="mt-6 space-y-4">
                {['feature1', 'feature2', 'feature3'].map((feature) => (
                  <li key={feature} className="flex">
                    <span className="text-green-500">✓</span>
                    <span className="ml-3 text-base text-gray-500">{t(`home.pages.${feature}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <Link
                to="/pages"
                className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-5 inline-flex items-center justify-center text-base font-medium text-white hover:bg-primary-700"
              >
                {t('home.pages.create')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 