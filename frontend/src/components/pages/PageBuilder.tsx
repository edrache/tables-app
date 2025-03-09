import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePageStore } from '../../store/pageStore'
import { useTableStore } from '../../store/tableStore'
import { useAuthStore } from '../../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PageBox } from '../../store/pageStore'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import TagInput from '../common/TagInput'

function Box({ box, tables, updateBoxTable, updateBoxTitle, removeBox, startEditingBox, borderRadius, gap, updateBoxColors, defaultBoxBackgroundColor, defaultBoxTextColor, defaultBoxBorderWidth, defaultBoxBorderColor, defaultBoxFontFamily, defaultBoxTitleFontFamily }: { 
  box: PageBox; 
  tables: any[]; 
  updateBoxTable: (id: string, tableId: string | null) => void;
  updateBoxTitle: (id: string, title: string | null) => void;
  removeBox: (id: string) => void;
  startEditingBox: (id: string) => void;
  borderRadius: number;
  gap: number;
  updateBoxColors: (boxId: string, backgroundColor: string | null, textColor: string | null) => void;
  defaultBoxBackgroundColor: string;
  defaultBoxTextColor: string;
  defaultBoxBorderWidth: number;
  defaultBoxBorderColor: string;
  defaultBoxFontFamily: string;
  defaultBoxTitleFontFamily: string;
}) {
  const { t } = useTranslation()
  const [width, height] = box.size.split('x').map(Number)
  const [x, y] = (box.position || '0,0').split(',').map(Number)
  const [showColorMenu, setShowColorMenu] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  
  const calculateMenuPosition = () => {
    if (!boxRef.current) return null
    
    const rect = boxRef.current.getBoundingClientRect()
    const [boxX] = (box.position || '0,0').split(',').map(Number)
    const isInRightHalf = boxX >= 5 // Box jest w prawej połowie siatki (kolumny 5-9)
    
    return {
      top: rect.top + window.scrollY,
      left: isInRightHalf 
        ? rect.left + window.scrollX - 340 // Menu po lewej stronie boxa
        : rect.right + window.scrollX + 20 // Menu po prawej stronie boxa
    }
  }

  const handleToggleMenu = () => {
    const position = calculateMenuPosition()
    if (position) {
      setMenuPosition(position)
      setShowColorMenu(prev => !prev)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setShowColorMenu(false)
      }
    }

    if (showColorMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorMenu])
  
  const style = {
    gridColumn: `${x + 1} / span ${width}`,
    gridRow: `${y + 1} / span ${height}`,
    height: 'calc(100% - ${gap * 2}px)',
    borderRadius: `${borderRadius}px`,
    margin: `${gap}px`,
    backgroundColor: box.backgroundColor || defaultBoxBackgroundColor,
    color: box.textColor || defaultBoxTextColor,
    borderWidth: `${defaultBoxBorderWidth}px`,
    borderColor: defaultBoxBorderColor,
    borderStyle: 'solid'
  }

  return (
    <div
      ref={boxRef}
      style={style}
      className="relative shadow-sm border border-gray-200"
    >
      <div className="absolute top-0 right-0 z-20 p-1 flex gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleMenu()
          }}
          className="p-1.5 rounded-full hover:bg-opacity-90 transition-colors bg-gray-100 hover:bg-gray-200"
          title={t('pages.editor.layout.box.settings')}
        >
          ⚙️
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            removeBox(box.id)
          }}
          className="p-1 text-red-600 hover:text-red-700 bg-white rounded shadow-sm border border-gray-200"
        >
          ✕
        </button>
      </div>

      {showColorMenu && (
        <div 
          ref={menuRef}
          className="absolute p-4 bg-white rounded-lg shadow-lg border border-gray-200"
          style={{
            top: 0,
            [x >= 5 ? 'right' : 'left']: '100%',
            marginLeft: x >= 5 ? '' : '20px',
            marginRight: x >= 5 ? '20px' : '',
            width: 320,
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.editor.layout.box.title')}
              </label>
              <input
                type="text"
                value={box.customTitle || ''}
                onChange={(e) => updateBoxTitle(box.id, e.target.value || null)}
                placeholder={t('pages.editor.layout.box.titlePlaceholder')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.editor.layout.box.table')}
              </label>
              <select
                value={box.tableId || ''}
                onChange={(e) => updateBoxTable(box.id, e.target.value || null)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
                <option value="">{t('pages.editor.layout.box.selectTable')}</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.editor.layout.box.backgroundColor')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={box.backgroundColor || defaultBoxBackgroundColor}
                  onChange={(e) => updateBoxColors(box.id, e.target.value, box.textColor)}
                  className="h-8 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={box.backgroundColor || defaultBoxBackgroundColor}
                  onChange={(e) => updateBoxColors(box.id, e.target.value, box.textColor)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.editor.layout.box.textColor')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={box.textColor || defaultBoxTextColor}
                  onChange={(e) => updateBoxColors(box.id, box.backgroundColor, e.target.value)}
                  className="h-8 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={box.textColor || defaultBoxTextColor}
                  onChange={(e) => updateBoxColors(box.id, box.backgroundColor, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowColorMenu(false)
                  startEditingBox(box.id)
                }}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {t('pages.editor.layout.box.position')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-sm font-medium">
          {box.customTitle || (box.tableId && tables.find(t => t.id === box.tableId)?.name)}
        </h3>
      </div>
    </div>
  )
}

const PageBuilder = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { addPage, updatePage, getPageBySlug } = usePageStore()
  const { getTables } = useTableStore()
  const { user } = useAuthStore()
  const [success, setSuccess] = useState(false)
  const [layout, setLayout] = useState<PageBox[]>([])
  const [tags, setTags] = useState<string[]>([])
  
  // Przekieruj do strony logowania, jeśli użytkownik nie jest zalogowany
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true })
    }
  }, [user, navigate])

  // Jeśli użytkownik nie jest zalogowany, nie renderuj komponentu
  if (!user) {
    return null
  }

  const tables = getTables()
  const existingPage = slug ? getPageBySlug(slug) : null

  // Sprawdź, czy użytkownik jest właścicielem strony przy edycji
  useEffect(() => {
    if (existingPage && existingPage.owner !== user.username) {
      navigate('/pages')
    }
  }, [existingPage, user, navigate])

  const pageSchema = z.object({
    name: z.string().min(1, t('pages.editor.validation.nameRequired')),
    description: z.string().min(1, t('pages.editor.validation.descriptionRequired')),
    slug: z.string().min(1, t('pages.editor.validation.slugRequired')).regex(/^[a-z0-9-]+$/, t('pages.editor.validation.slugFormat')),
    theme: z.string(),
    borderRadius: z.number().min(0).max(24).default(8),
    gap: z.number().min(0).max(30).default(8),
    showGrid: z.boolean().default(true),
    backgroundColor: z.string().default('#f3f4f6'),
    defaultBoxBackgroundColor: z.string().default('#ffffff'),
    defaultBoxTextColor: z.string().default('#000000'),
    defaultBoxBorderWidth: z.number().min(0).max(10).default(1),
    defaultBoxBorderColor: z.string().default('#e5e7eb'),
    defaultBoxTextSize: z.number().min(8).max(200).default(24),
    defaultBoxFontFamily: z.string().default('Arial, sans-serif'),
    defaultBoxTitleFontFamily: z.string().default('Arial, sans-serif'),
    colorPalette: z.array(z.string()).default([]),
    useRandomColors: z.boolean().default(false),
    tags: z.array(z.string()).default([])
  })

  type PageFormData = z.infer<typeof pageSchema>

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      theme: 'default',
      borderRadius: 8,
      gap: 8,
      showGrid: true,
      backgroundColor: '#f3f4f6',
      defaultBoxBackgroundColor: '#ffffff',
      defaultBoxTextColor: '#000000',
      defaultBoxBorderWidth: 1,
      defaultBoxBorderColor: '#e5e7eb'
    }
  })

  const [isSelectingArea, setIsSelectingArea] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null)
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null)
  const [colorPaletteInput, setColorPaletteInput] = useState('')
  const [palettePreview, setPalettePreview] = useState<string[]>([])
  const [customFont, setCustomFont] = useState('')
  const [addedFonts, setAddedFonts] = useState<Array<{name: string, value: string}>>(() => {
    const saved = localStorage.getItem('addedFonts')
    return saved ? JSON.parse(saved) : []
  })

  // Funkcja pomocnicza do sprawdzania, czy komórka jest w zaznaczonym obszarze
  const isCellSelected = (x: number, y: number) => {
    if (!selectionStart || !hoveredCell) return false
    
    const startX = Math.min(selectionStart.x, hoveredCell.x)
    const endX = Math.max(selectionStart.x, hoveredCell.x)
    const startY = Math.min(selectionStart.y, hoveredCell.y)
    const endY = Math.max(selectionStart.y, hoveredCell.y)
    
    return x >= startX && x <= endX && y >= startY && y <= endY
  }

  // Funkcja do rozpoczęcia zaznaczania
  const handleCellMouseDown = (x: number, y: number) => {
    if (!isSelectingArea) return
    setSelectionStart({ x, y })
  }

  // Funkcja do śledzenia zaznaczenia
  const handleCellMouseEnter = (x: number, y: number) => {
    if (!isSelectingArea) return
    setHoveredCell({ x, y })
  }

  // Funkcja do zakończenia zaznaczania i dodania/edycji boxa
  const handleCellMouseUp = () => {
    if (!isSelectingArea || !selectionStart || !hoveredCell) return

    const startX = Math.min(selectionStart.x, hoveredCell.x)
    const endX = Math.max(selectionStart.x, hoveredCell.x)
    const startY = Math.min(selectionStart.y, hoveredCell.y)
    const endY = Math.max(selectionStart.y, hoveredCell.y)

    const width = endX - startX + 1
    const height = endY - startY + 1

    if (editingBoxId) {
      // Tryb edycji - aktualizuj istniejący box
      setLayout(prev => prev.map(box => 
        box.id === editingBoxId 
          ? { ...box, size: `${width}x${height}`, position: `${startX},${startY}` }
          : box
      ))
      setEditingBoxId(null)
    } else {
      // Tryb dodawania - utwórz nowy box
      setLayout(prev => [...prev, {
        id: Math.random().toString(),
        size: `${width}x${height}`,
        position: `${startX},${startY}`,
        tableId: null,
        customTitle: null,
        backgroundColor: null,
        textColor: null
      }])
    }

    // Resetuj stan zaznaczania
    setIsSelectingArea(false)
    setSelectionStart(null)
    setHoveredCell(null)
  }

  // Funkcja do rozpoczęcia edycji boxa
  const startEditingBox = (boxId: string) => {
    setEditingBoxId(boxId)
    setIsSelectingArea(true)
  }

  useEffect(() => {
    if (existingPage) {
      reset({
        name: existingPage.name,
        description: existingPage.description,
        slug: existingPage.slug,
        theme: existingPage.theme,
        borderRadius: existingPage.borderRadius,
        gap: existingPage.gap,
        showGrid: existingPage.showGrid,
        backgroundColor: existingPage.backgroundColor,
        defaultBoxBackgroundColor: existingPage.defaultBoxBackgroundColor,
        defaultBoxTextColor: existingPage.defaultBoxTextColor,
        defaultBoxBorderWidth: existingPage.defaultBoxBorderWidth,
        defaultBoxBorderColor: existingPage.defaultBoxBorderColor,
        defaultBoxTextSize: existingPage.defaultBoxTextSize,
        defaultBoxFontFamily: existingPage.defaultBoxFontFamily,
        defaultBoxTitleFontFamily: existingPage.defaultBoxTitleFontFamily,
        colorPalette: existingPage.colorPalette,
        useRandomColors: existingPage.useRandomColors,
        tags: existingPage.tags || []
      })
      setTags(existingPage.tags || [])
      // Dodaj pozycje do istniejących boxów jeśli ich nie mają
      const migratedLayout = existingPage.layout.map((box, index) => ({
        ...box,
        position: box.position || `${index % 4},${Math.floor(index / 4)}`
      }))
      setLayout(migratedLayout)
    }
  }, [existingPage, reset])

  const onSubmit = (data: PageFormData) => {
    if (!user) {
      alert(t('common.error.loginRequired'))
      return
    }

    const pageData = {
      name: data.name,
      description: data.description,
      slug: data.slug,
      theme: data.theme,
      borderRadius: data.borderRadius,
      gap: data.gap,
      showGrid: data.showGrid,
      backgroundColor: data.backgroundColor,
      defaultBoxBackgroundColor: data.defaultBoxBackgroundColor,
      defaultBoxTextColor: data.defaultBoxTextColor,
      defaultBoxBorderWidth: data.defaultBoxBorderWidth,
      defaultBoxBorderColor: data.defaultBoxBorderColor,
      defaultBoxTextSize: data.defaultBoxTextSize,
      defaultBoxFontFamily: data.defaultBoxFontFamily,
      defaultBoxTitleFontFamily: data.defaultBoxTitleFontFamily,
      colorPalette: data.colorPalette,
      useRandomColors: data.useRandomColors,
      layout: layout,
      owner: user.username,
      tags: tags
    }

    if (existingPage) {
      updatePage(existingPage.id, pageData)
    } else {
      addPage(pageData)
    }

    // Pokaż komunikat o sukcesie
    setSuccess(true)

    // Przekieruj do strony po 1.5 sekundy
    setTimeout(() => {
      navigate(`/page/${data.slug}`)
    }, 1500)
  }

  const updateBoxTable = (boxId: string, tableId: string | null) => {
    setLayout(prev => prev.map(box => 
      box.id === boxId ? { ...box, tableId } : box
    ))
  }

  const updateBoxTitle = (boxId: string, title: string | null) => {
    setLayout(prev => prev.map(box => 
      box.id === boxId ? { ...box, customTitle: title } : box
    ))
  }

  const removeBox = (boxId: string) => {
    setLayout(prev => prev.filter(box => box.id !== boxId))
  }

  const updateBoxColors = (boxId: string, backgroundColor: string | null, textColor: string | null) => {
    setLayout(prev => prev.map(box => 
      box.id === boxId ? { ...box, backgroundColor, textColor } : box
    ))
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!active || !over) return

    // Pobierz wymiary kontenera siatki
    const gridContainer = document.querySelector('.grid-container')
    if (!gridContainer) return
    const gridRect = gridContainer.getBoundingClientRect()

    // Oblicz pozycję kursora względem kontenera
    const mouseX = over.rect.left - gridRect.left
    const mouseY = over.rect.top - gridRect.top

    // Oblicz indeksy komórki (0-3 dla x i y)
    const cellWidth = gridRect.width / 4
    const cellHeight = gridRect.height / 4
    const x = Math.min(Math.max(Math.floor(mouseX / cellWidth), 0), 3)
    const y = Math.min(Math.max(Math.floor(mouseY / cellHeight), 0), 3)

    // Sprawdź czy nowa pozycja nie koliduje z innymi boxami
    const isPositionOccupied = layout.some(box => {
      if (box.id === active.id) return false
      const [boxX, boxY] = box.position.split(',').map(Number)
      return boxX === x && boxY === y
    })

    if (!isPositionOccupied) {
      setLayout(items => items.map(item => {
        if (item.id === active.id) {
          return {
            ...item,
            position: `${x},${y}`
          }
        }
        return item
      }))
    }
  }

  // Funkcja do ładowania fonta z Google Fonts
  const loadGoogleFont = (fontFamily: string) => {
    const formattedFontFamily = fontFamily.replace(/\s+/g, '+')
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFontFamily}:wght@400;500;600&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  // Załaduj zapisane fonty przy starcie
  useEffect(() => {
    addedFonts.forEach(font => {
      loadGoogleFont(font.name)
    })
  }, [])

  // Funkcja do dodawania nowego fonta
  const handleAddFont = () => {
    if (customFont) {
      const fontValue = `${customFont}, sans-serif`
      loadGoogleFont(customFont)
      
      // Dodaj font do listy
      const newFont = { name: customFont, value: fontValue }
      setAddedFonts(prev => {
        const updated = [...prev, newFont]
        localStorage.setItem('addedFonts', JSON.stringify(updated))
        return updated
      })
      
      // Ustaw nowy font jako aktywny
      register('defaultBoxFontFamily').onChange({ target: { value: fontValue } })
      setCustomFont('')
    }
  }

  // Dodajemy funkcję extractColorsFromCoolors
  const extractColorsFromCoolors = (text: string): string[] => {
    // Szukamy kolorów HEX w formacie #XXXXXX lub #XXXXXXff
    const hexPattern = /#[0-9a-fA-F]{6}(?:ff)?/g
    const matches = text.match(hexPattern)
    if (!matches) return []
    
    // Usuwamy 'ff' z końca jeśli występuje i zwracamy unikalne kolory
    return [...new Set(matches.map(color => color.slice(0, 7)))]
  }

  // W komponencie PageBuilder dodajemy obsługę palety kolorów
  const handlePaletteInput = (text: string) => {
    setColorPaletteInput(text)
    const colors = extractColorsFromCoolors(text)
    setPalettePreview(colors)
    
    if (colors.length > 0) {
      // Aktualizuj paletę w formularzu
      register('colorPalette').onChange({ target: { value: colors } })
      
      // Ustaw domyślne kolory z palety
      register('defaultBoxBackgroundColor').onChange({ target: { value: colors[0] } })
      register('defaultBoxTextColor').onChange({ target: { value: colors[1] || colors[0] } })
      register('defaultBoxBorderColor').onChange({ target: { value: colors[2] || colors[0] } })
    }
  }

  // Funkcja do losowania kolorów z palety
  const getRandomColors = (palette: string[]): [string, string, string] => {
    const shuffled = [...palette].sort(() => Math.random() - 0.5)
    return [
      shuffled[0] || watch('defaultBoxBackgroundColor'),
      shuffled[1] || watch('defaultBoxTextColor'),
      shuffled[2] || watch('defaultBoxBorderColor')
    ]
  }

  // Aktualizuj kolory boxów gdy zmienia się paleta lub opcja losowania
  useEffect(() => {
    if (palettePreview.length > 0) {
      setLayout(prev => prev.map(box => {
        if (watch('useRandomColors')) {
          const [bg, text, border] = getRandomColors(palettePreview)
          return { ...box, backgroundColor: bg, textColor: text, borderColor: border }
        } else {
          return {
            ...box,
            backgroundColor: watch('defaultBoxBackgroundColor'),
            textColor: watch('defaultBoxTextColor'),
            borderColor: watch('defaultBoxBorderColor')
          }
        }
      }))
    }
  }, [palettePreview, watch('useRandomColors'), watch('defaultBoxBackgroundColor'), watch('defaultBoxTextColor'), watch('defaultBoxBorderColor')])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.name')}
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
                {t('pages.editor.description')}
              </label>
              <input
                type="text"
                id="description"
                {...register('description')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.slug')}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  /page/
                </span>
                <input
                  type="text"
                  id="slug"
                  {...register('slug')}
                  className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.theme.label')}
              </label>
              <select
                id="theme"
                {...register('theme')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="default">{t('pages.editor.theme.default')}</option>
                <option value="dark">{t('pages.editor.theme.dark')}</option>
                <option value="fantasy">{t('pages.editor.theme.fantasy')}</option>
                <option value="scifi">{t('pages.editor.theme.scifi')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="borderRadius" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.borderRadius')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="borderRadius"
                  min="0"
                  max="24"
                  step="2"
                  {...register('borderRadius', { valueAsNumber: true })}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 w-8">
                  {watch('borderRadius')}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="gap" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.gap')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="gap"
                  min="0"
                  max="30"
                  step="1"
                  {...register('gap', { valueAsNumber: true })}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 w-8">
                  {watch('gap')}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.backgroundColor')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  id="backgroundColorPicker"
                  value={watch('backgroundColor')}
                  onChange={(e) => {
                    const color = e.target.value;
                    const textInput = document.getElementById('backgroundColorText') as HTMLInputElement;
                    if (textInput) {
                      textInput.value = color;
                    }
                    register('backgroundColor').onChange(e);
                  }}
                  className="h-8 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  id="backgroundColorText"
                  {...register('backgroundColor')}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  onChange={(e) => {
                    const color = e.target.value;
                    const picker = document.getElementById('backgroundColorPicker') as HTMLInputElement;
                    if (picker) {
                      picker.value = color;
                    }
                    register('backgroundColor').onChange(e);
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="defaultBoxBackgroundColor" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.boxSettings.backgroundColor')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  id="defaultBoxBackgroundColorPicker"
                  value={watch('defaultBoxBackgroundColor')}
                  onChange={(e) => {
                    const color = e.target.value;
                    const textInput = document.getElementById('defaultBoxBackgroundColorText') as HTMLInputElement;
                    if (textInput) {
                      textInput.value = color;
                    }
                    register('defaultBoxBackgroundColor').onChange(e);
                  }}
                  className="h-8 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  id="defaultBoxBackgroundColorText"
                  {...register('defaultBoxBackgroundColor')}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  onChange={(e) => {
                    const color = e.target.value;
                    const picker = document.getElementById('defaultBoxBackgroundColorPicker') as HTMLInputElement;
                    if (picker) {
                      picker.value = color;
                    }
                    register('defaultBoxBackgroundColor').onChange(e);
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="defaultBoxTextColor" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.boxSettings.textColor')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  id="defaultBoxTextColorPicker"
                  value={watch('defaultBoxTextColor')}
                  onChange={(e) => {
                    const color = e.target.value;
                    const textInput = document.getElementById('defaultBoxTextColorText') as HTMLInputElement;
                    if (textInput) {
                      textInput.value = color;
                    }
                    register('defaultBoxTextColor').onChange(e);
                  }}
                  className="h-8 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  id="defaultBoxTextColorText"
                  {...register('defaultBoxTextColor')}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  onChange={(e) => {
                    const color = e.target.value;
                    const picker = document.getElementById('defaultBoxTextColorPicker') as HTMLInputElement;
                    if (picker) {
                      picker.value = color;
                    }
                    register('defaultBoxTextColor').onChange(e);
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="defaultBoxBorderWidth" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.boxSettings.borderWidth')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="defaultBoxBorderWidth"
                  min="0"
                  max="10"
                  step="1"
                  {...register('defaultBoxBorderWidth', { valueAsNumber: true })}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 w-8">
                  {watch('defaultBoxBorderWidth')}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="defaultBoxBorderColor" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.boxSettings.borderColor')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  id="defaultBoxBorderColorPicker"
                  value={watch('defaultBoxBorderColor')}
                  onChange={(e) => {
                    const color = e.target.value;
                    const textInput = document.getElementById('defaultBoxBorderColorText') as HTMLInputElement;
                    if (textInput) {
                      textInput.value = color;
                    }
                    register('defaultBoxBorderColor').onChange(e);
                  }}
                  className="h-8 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  id="defaultBoxBorderColorText"
                  {...register('defaultBoxBorderColor')}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  onChange={(e) => {
                    const color = e.target.value;
                    const picker = document.getElementById('defaultBoxBorderColorPicker') as HTMLInputElement;
                    if (picker) {
                      picker.value = color;
                    }
                    register('defaultBoxBorderColor').onChange(e);
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="defaultBoxTextSize" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.boxSettings.textSize')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  id="defaultBoxTextSize"
                  min="8"
                  max="200"
                  {...register('defaultBoxTextSize', { valueAsNumber: true })}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">
                  {t('pages.editor.settings.boxSettings.textSizeRange')}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="defaultBoxFontFamily" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.boxSettings.fontFamily.label')}
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={customFont}
                  onChange={(e) => setCustomFont(e.target.value)}
                  placeholder={t('pages.editor.settings.boxSettings.fontFamily.placeholder')}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddFont}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {t('pages.editor.settings.boxSettings.fontFamily.addFont')}
                </button>
              </div>
              <select
                id="defaultBoxFontFamily"
                {...register('defaultBoxFontFamily')}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                style={{ fontFamily: watch('defaultBoxFontFamily') }}
              >
                <option value="Arial, sans-serif" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {t('pages.editor.settings.boxSettings.fontFamily.default')}
                </option>
                {addedFonts.map((font, index) => (
                  <option key={index} value={font.value} style={{ fontFamily: font.value }}>
                    {font.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {t('pages.editor.settings.boxSettings.fontFamily.help')}
              </p>
            </div>

            <div>
              <label htmlFor="defaultBoxTitleFontFamily" className="block text-sm font-medium text-gray-700">
                {t('pages.editor.settings.boxSettings.titleFontFamily.label')}
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={customFont}
                  onChange={(e) => setCustomFont(e.target.value)}
                  placeholder={t('pages.editor.settings.boxSettings.titleFontFamily.placeholder')}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddFont}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {t('pages.editor.settings.boxSettings.titleFontFamily.addFont')}
                </button>
              </div>
              <select
                id="defaultBoxTitleFontFamily"
                {...register('defaultBoxTitleFontFamily')}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                style={{ fontFamily: watch('defaultBoxTitleFontFamily') }}
              >
                <option value="Arial, sans-serif" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {t('pages.editor.settings.boxSettings.titleFontFamily.default')}
                </option>
                {addedFonts.map((font, index) => (
                  <option key={index} value={font.value} style={{ fontFamily: font.value }}>
                    {font.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {t('pages.editor.settings.boxSettings.titleFontFamily.help')}
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showGrid"
                {...register('showGrid')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="showGrid" className="ml-2 block text-sm text-gray-900">
                {t('pages.editor.settings.showGrid')}
              </label>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-medium">{t('pages.editor.settings.colorPalette.title')}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('pages.editor.settings.colorPalette.paste')}
              </label>
              <textarea
                value={colorPaletteInput}
                onChange={(e) => handlePaletteInput(e.target.value)}
                className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder={t('pages.editor.settings.colorPalette.placeholder')}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="useRandomColors"
                {...register('useRandomColors')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="useRandomColors" className="ml-2 block text-sm text-gray-900">
                {t('pages.editor.settings.colorPalette.useRandom')}
              </label>
            </div>

            {palettePreview.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pages.editor.settings.colorPalette.preview')}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {palettePreview.map((color, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 rounded border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.editor.tags')}
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder={t('pages.editor.tagsPlaceholder')}
              className="border-gray-300"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsSelectingArea(true)
                  setEditingBoxId(null)
                  setSelectionStart(null)
                  setHoveredCell(null)
                }}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t('pages.editor.layout.addBox')}
              </button>
            </div>

            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {existingPage ? t('pages.editor.actions.update') : t('pages.editor.actions.save')}
            </button>
          </div>
        </form>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800">
            {existingPage ? t('pages.editor.success.updated') : t('pages.editor.success.created')}
          </p>
        </div>
      )}

      <div className={`p-8 rounded-lg ${
        layout.length === 0 ? 'bg-gray-50 border-2 border-dashed border-gray-300' : ''
      }`}>
        <div className={`relative w-full h-[80vh] grid grid-cols-10 grid-rows-8 ${
          layout.length > 0 || isSelectingArea ? `
            ${watch('theme') === 'dark' ? 'bg-gray-900 text-white' : ''}
            ${watch('theme') === 'fantasy' ? 'bg-amber-50' : ''}
            ${watch('theme') === 'scifi' ? 'bg-slate-900 text-blue-100' : ''}
          ` : ''
        }`}
        style={{
          backgroundColor: watch('backgroundColor'),
          color: watch('theme') === 'dark' ? 'white' : 
                 watch('theme') === 'scifi' ? 'rgb(219 234 254)' : 
                 'inherit'
        }}>
          {/* Grid cells for selection */}
          {Array.from({ length: 80 }).map((_, index) => {
            const x = index % 10
            const y = Math.floor(index / 10)
            return (
              <div
                key={index}
                onMouseDown={() => handleCellMouseDown(x, y)}
                onMouseEnter={() => handleCellMouseEnter(x, y)}
                onMouseUp={handleCellMouseUp}
                className={`
                  border-r border-b border-dashed
                  ${isSelectingArea ? 'cursor-pointer' : ''}
                  ${isCellSelected(x, y) ? 'bg-blue-200 bg-opacity-50' : ''}
                  ${watch('theme') === 'dark' ? 'border-gray-700' :
                    watch('theme') === 'fantasy' ? 'border-amber-200' :
                    watch('theme') === 'scifi' ? 'border-blue-800' :
                    'border-gray-300'
                  }
                `}
                style={{
                  gridColumn: `${x + 1}`,
                  gridRow: `${y + 1}`,
                }}
              />
            )
          })}

          {/* Boxy */}
          {layout.map((box) => (
            <Box
              key={box.id}
              box={box}
              tables={tables}
              updateBoxTable={updateBoxTable}
              updateBoxTitle={updateBoxTitle}
              removeBox={removeBox}
              startEditingBox={startEditingBox}
              borderRadius={watch('borderRadius')}
              gap={watch('gap')}
              updateBoxColors={updateBoxColors}
              defaultBoxBackgroundColor={watch('defaultBoxBackgroundColor')}
              defaultBoxTextColor={watch('defaultBoxTextColor')}
              defaultBoxBorderWidth={watch('defaultBoxBorderWidth')}
              defaultBoxBorderColor={watch('defaultBoxBorderColor')}
              defaultBoxFontFamily={watch('defaultBoxFontFamily')}
              defaultBoxTitleFontFamily={watch('defaultBoxTitleFontFamily')}
            />
          ))}
        </div>

        {layout.length === 0 && !isSelectingArea && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('pages.editor.layout.empty.title')}</h3>
            <p className="text-gray-500">{t('pages.editor.layout.empty.description')}</p>
          </div>
        )}

        {isSelectingArea && (
          <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <p className="text-sm text-gray-600 mb-2">
              {editingBoxId ? t('pages.editor.layout.editBox') : t('pages.editor.layout.selectArea')}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSelectingArea(false)
                setEditingBoxId(null)
                setSelectionStart(null)
                setHoveredCell(null)
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {t('pages.editor.layout.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageBuilder 