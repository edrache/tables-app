import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTableStore } from '../../store/tableStore'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TagInput from '../common/TagInput'

const TableEditor = () => {
  const navigate = useNavigate()
  const { addTable } = useTableStore()
  const { user } = useAuthStore()
  const [success, setSuccess] = useState(false)
  const [importContent, setImportContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const { t } = useTranslation()

  const tableSchema = z.object({
    name: z.string().min(1, t('tables.editor.validation.nameRequired')),
    description: z.string().min(1, t('tables.editor.validation.descriptionRequired')),
    content: z.string().refine((val) => {
      const lines = val.split('\n')
      return lines.every(line => {
        if (line.trim() === '') return true
        const [item, weight] = line.split(':')
        return (
          item &&
          weight &&
          item.length <= 200 &&
          Number(weight) >= 0 &&
          Number(weight) <= 100
        )
      })
    }, t('tables.editor.validation.invalidFormat'))
  })
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<z.infer<typeof tableSchema>>({
    resolver: zodResolver(tableSchema)
  })

  const onSubmit = (data: z.infer<typeof tableSchema>) => {
    if (!user) {
      alert(t('common.error.loginRequired'))
      return
    }

    // Przekształć zawartość na format TableItem[]
    const items = data.content
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [item, weight] = line.split(':')
        return {
          item: item.trim(),
          weight: Number(weight.trim())
        }
      })

    // Dodaj tabelę do store'a
    addTable({
      name: data.name,
      description: data.description,
      tags: tags,
      items: items,
      owner: user.username
    })

    // Pokaż komunikat o sukcesie
    setSuccess(true)

    // Przekieruj do listy tabel po 1.5 sekundy
    setTimeout(() => {
      navigate('/tables')
    }, 1500)
  }

  const handleImport = () => {
    if (!user) {
      alert(t('common.error.loginRequired'))
      return
    }

    const tables: { name: string; content: string[] }[] = []
    let currentTable: { name: string; content: string[] } | null = null

    importContent.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine === '') return

      if (!trimmedLine.includes(':')) {
        // To jest nazwa nowej tabeli
        if (currentTable) {
          tables.push(currentTable)
        }
        currentTable = {
          name: trimmedLine,
          content: []
        }
      } else if (currentTable) {
        // To jest rekord dla aktualnej tabeli
        currentTable.content.push(trimmedLine)
      }
    })

    if (currentTable) {
      tables.push(currentTable)
    }

    // Dodaj wszystkie tabele
    tables.forEach(table => {
      addTable({
        name: table.name,
        description: table.name, // Używamy nazwy jako opisu
        tags: [],
        items: table.content.map(line => {
          const [item, weight] = line.split(':')
          return {
            item: item.trim(),
            weight: Number(weight.trim())
          }
        }),
        owner: user.username
      })
    })

    // Pokaż komunikat o sukcesie
    setSuccess(true)

    // Przekieruj do listy tabel po 1.5 sekundy
    setTimeout(() => {
      navigate('/tables')
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('tables.editor.title')}
      </h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800">
            {t('tables.editor.success')}
          </p>
        </div>
      )}

      <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('tables.editor.import.title')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('tables.editor.import.description')}
        </p>
        <textarea
          value={importContent}
          onChange={(e) => setImportContent(e.target.value)}
          className="w-full h-40 mb-4 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono"
          placeholder={t('tables.editor.import.placeholder')}
        />
        <button
          type="button"
          onClick={handleImport}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {t('tables.editor.import.button')}
        </button>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('tables.editor.title')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('tables.editor.name')}
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              {t('tables.editor.description')}
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tables.editor.tags')}
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder={t('tables.editor.tagsPlaceholder')}
              className="border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              {t('tables.editor.content')}
            </label>
            <textarea
              id="content"
              rows={10}
              {...register('content')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono"
              placeholder={t('tables.editor.contentPlaceholder')}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TableEditor 