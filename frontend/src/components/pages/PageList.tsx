import { usePageStore } from '../../store/pageStore'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const PageList = () => {
  const { getPages } = usePageStore()
  const { t } = useTranslation()
  const pages = getPages()

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('pages.empty.title')}</h2>
        <p className="text-gray-600 mb-6">{t('pages.empty.description')}</p>
        <Link
          to="/page/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {t('navigation.newPage')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('pages.myPages')}</h2>
        <Link
          to="/page/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {t('navigation.newPage')}
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pages.map(page => (
          <div key={page.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{page.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{page.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">{t('pages.details.url')}:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">/page/{page.slug}</code>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">{t('pages.details.theme')}:</span>
                  <span className="capitalize">{page.theme}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">{t('pages.details.boxCount')}:</span>
                  <span>{page.layout.length}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <Link
                  to={`/page/${page.slug}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  {t('common.view')}
                </Link>
                <Link
                  to={`/page/${page.slug}/edit`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('common.edit')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PageList 