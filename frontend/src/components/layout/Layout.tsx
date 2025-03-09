import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [isNavVisible, setIsNavVisible] = useState(true)
  const location = useLocation()
  const { t } = useTranslation()

  useEffect(() => {
    // Ukryj panel tylko na widoku strony (nie na edycji i nie na /page/new)
    const isPageView = /^\/page\/[^/]+$/.test(location.pathname) && 
      !location.pathname.endsWith('/edit') && 
      !location.pathname.endsWith('/new')
    setIsNavVisible(!isPageView)

    const handleToggleNavigation = () => {
      setIsNavVisible(prev => !prev)
    }

    if (isPageView) {
      window.addEventListener('toggleNavigation', handleToggleNavigation)
      return () => {
        window.removeEventListener('toggleNavigation', handleToggleNavigation)
      }
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav 
        className={`fixed top-0 left-0 right-0 bg-white shadow-sm transition-transform duration-300 z-50 ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-600">{t('home.title')}</span>
              </Link>
              {isAuthenticated && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/tables"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                  >
                    {t('navigation.myTables')}
                  </Link>
                  <Link
                    to="/pages"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                  >
                    {t('navigation.myPages')}
                  </Link>
                  <Link
                    to="/table/new"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                  >
                    {t('navigation.newTable')}
                  </Link>
                  <Link
                    to="/page/new"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                  >
                    {t('navigation.newPage')}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  {t('common.logout')}
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  {t('common.login')}
                </Link>
              )}
              <div className="ml-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className={`${isNavVisible ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  )
}

export default Layout 