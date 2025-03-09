import { useState } from 'react'
import { useTableStore } from '../../store/tableStore'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const TableList = () => {
  const { getTables, rollOnTable } = useTableStore()
  const [rollResults, setRollResults] = useState<{[key: string]: string}>({})
  const { t } = useTranslation()
  
  const tables = getTables()

  const handleRoll = (tableId: string) => {
    const result = rollOnTable(tableId)
    if (result) {
      setRollResults(prev => ({
        ...prev,
        [tableId]: result.item
      }))
    }
  }

  if (tables.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('tables.empty.title')}</h2>
        <p className="text-gray-600 mb-6">{t('tables.empty.description')}</p>
        <Link
          to="/table/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {t('navigation.newTable')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('tables.myTables')}</h2>
        <Link
          to="/table/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {t('navigation.newTable')}
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tables.map(table => (
          <div key={table.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{table.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{table.description}</p>
              
              {rollResults[table.id] && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-800">
                    {t('tables.rollResult')}: {rollResults[table.id]}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleRoll(table.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  {t('tables.roll')}
                </button>
                <Link
                  to={`/table/${table.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('common.edit')}
                </Link>
              </div>
            </div>
            
            {table.tags.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {table.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableList 