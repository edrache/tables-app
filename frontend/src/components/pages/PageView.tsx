import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePageStore } from '../../store/pageStore'
import { useTableStore } from '../../store/tableStore'
import { useState, useEffect, useRef } from 'react'
import type { Page, PageBox } from '../../store/pageStore'
import { createPortal } from 'react-dom'

const FitText = ({ children, className, style }: { children: React.ReactNode, className: string, style?: React.CSSProperties }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const text = textRef.current
    if (!container || !text) return

    const baseSize = parseFloat(window.getComputedStyle(text).fontSize)
    let low = 1
    let high = baseSize
    let mid: number = Math.floor((low + high) / 2)
    let bestFit = baseSize

    // Binary search for the best fitting font size
    while (low <= high) {
      mid = Math.floor((low + high) / 2)
      text.style.fontSize = `${mid}px`
      
      if (text.scrollWidth <= container.clientWidth && text.scrollHeight <= container.clientHeight) {
        bestFit = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    // Set the best fitting size
    text.style.fontSize = `${bestFit}px`
  }, [children])

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div ref={textRef} className={`${className} whitespace-nowrap`} style={style}>
        {children}
      </div>
    </div>
  )
}

const PageView = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { getPageBySlug, updatePage } = usePageStore()
  const { getTableById, rollOnTable, getTables } = useTableStore()
  const [rollResults, setRollResults] = useState<{[key: string]: string}>({})
  const tables = getTables()

  const page = getPageBySlug(slug || '')

  // Funkcja do ładowania fonta z Google Fonts
  const loadGoogleFont = (fontFamily: string) => {
    if (!fontFamily || fontFamily === 'Arial, sans-serif') return
    const baseFontFamily = fontFamily.split(',')[0].trim()
    const formattedFontFamily = baseFontFamily.replace(/\s+/g, '+')
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFontFamily}:wght@400;500;600&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  // Załaduj fonty przy inicjalizacji strony
  useEffect(() => {
    if (!page) return
    loadGoogleFont(page.defaultBoxFontFamily)
    loadGoogleFont(page.defaultBoxTitleFontFamily)
  }, [page?.defaultBoxFontFamily, page?.defaultBoxTitleFontFamily])

  // Dodaj dynamiczne style CSS
  useEffect(() => {
    if (!page) return

    const styleId = 'dynamic-text-sizes'
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = `
      .box-text {
        font-size: ${page.defaultBoxTextSize}px;
        line-height: 1.2;
        width: 100%;
        display: block;
        text-align: center;
        max-width: 100%;
        max-height: 100%;
        overflow: hidden;
      }
      .box-title {
        font-size: ${Math.floor(page.defaultBoxTextSize * 0.8)}px;
        line-height: 1.2;
        width: 100%;
        display: block;
        text-align: center;
        max-width: 100%;
        max-height: 100%;
        overflow: hidden;
      }
      .box-single-element {
        font-size: ${page.defaultBoxTextSize}px;
        line-height: 1.2;
        width: 100%;
        display: block;
        text-align: center;
        max-width: 100%;
        max-height: 100%;
        overflow: hidden;
      }
    `

    return () => {
      if (styleElement) {
        document.head.removeChild(styleElement)
      }
    }
  }, [page?.defaultBoxTextSize])

  // Automatyczne losowanie dla wszystkich boxów przy wejściu na stronę
  useEffect(() => {
    if (page) {
      const initialResults: {[key: string]: string} = {}
      page.layout.forEach(box => {
        if (box.tableId) {
          const result = rollOnTable(box.tableId)
          if (result) {
            initialResults[`${box.id}-${box.tableId}`] = result.item
          }
        }
      })
      setRollResults(initialResults)
    }
  }, [page])

  if (!page) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Strona nie została znaleziona</h2>
        <p className="text-gray-600 mb-6">Strona o podanym adresie URL nie istnieje.</p>
        <Link
          to="/pages"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Wróć do listy stron
        </Link>
      </div>
    )
  }

  const handleRoll = (boxId: string, tableId: string | null) => {
    if (!tableId) return

    const result = rollOnTable(tableId)
    if (result) {
      setRollResults(prev => ({
        ...prev,
        [`${boxId}-${tableId}`]: result.item
      }))
    }
  }

  const getBoxTitle = (box: PageBox) => {
    if (box.customTitle) return box.customTitle
    return null
  }

  const updateBoxTitle = (boxId: string, title: string | null) => {
    if (!page) return
    const updatedLayout = page.layout.map(box => 
      box.id === boxId ? { ...box, customTitle: title } : box
    )
    updatePage(page.id, { ...page, layout: updatedLayout })
  }

  const updateBoxTable = (boxId: string, tableId: string | null) => {
    if (!page) return
    const updatedLayout = page.layout.map(box => 
      box.id === boxId ? { ...box, tableId } : box
    )
    updatePage(page.id, { ...page, layout: updatedLayout })
  }

  const updateBoxColors = (boxId: string, backgroundColor: string | null, textColor: string | null) => {
    if (!page) return
    const updatedLayout = page.layout.map(box => 
      box.id === boxId ? { ...box, backgroundColor, textColor } : box
    )
    updatePage(page.id, { ...page, layout: updatedLayout })
  }

  const Box = ({ box, page }: { box: PageBox; page: Page }) => {
    const [width, height] = box.size.split('x').map(Number)
    const [x, y] = (box.position || '0,0').split(',').map(Number)

    const style = {
      gridColumn: `${x + 1} / span ${width}`,
      gridRow: `${y + 1} / span ${height}`,
      height: `calc(100% - ${page.gap * 2}px)`,
      borderRadius: `${page.borderRadius}px`,
      margin: `${page.gap}px`,
      backgroundColor: box.backgroundColor || page.defaultBoxBackgroundColor,
      color: box.textColor || page.defaultBoxTextColor,
      borderWidth: `${page.defaultBoxBorderWidth}px`,
      borderColor: page.defaultBoxBorderColor,
      borderStyle: page.defaultBoxBorderWidth === 0 ? 'none' : 'solid'
    }

    const title = getBoxTitle(box)
    const result = rollResults[`${box.id}-${box.tableId}`]
    const hasSingleElement = Boolean(title) !== Boolean(result)

    return (
      <div 
        style={style} 
        className={`relative shadow-sm overflow-hidden ${box.tableId ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={() => box.tableId && handleRoll(box.id, box.tableId)}
      >
        <div className="h-full flex flex-col p-2">
          {hasSingleElement ? (
            <div className="flex-1 flex items-center justify-center">
              {title ? (
                <FitText className="box-single-element" style={{ fontFamily: page.defaultBoxTitleFontFamily }}>
                  {title}
                </FitText>
              ) : (
                <FitText className="box-single-element" style={{ fontFamily: page.defaultBoxFontFamily }}>
                  {result}
                </FitText>
              )}
            </div>
          ) : (
            <>
              <div className="h-2/5 flex items-center justify-center">
                <FitText className="box-title" style={{ fontFamily: page.defaultBoxTitleFontFamily }}>
                  {title}
                </FitText>
              </div>
              <div className="h-3/5 flex items-center justify-center">
                <FitText className="box-text" style={{ fontFamily: page.defaultBoxFontFamily }}>
                  {result}
                </FitText>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: page.backgroundColor || '#f3f4f6' }}>
      <div 
        className="flex justify-between items-center px-4 py-2 backdrop-blur-sm" 
        style={{ borderBottomWidth: '0px' }}
      >
        <div className="flex items-baseline gap-2">
          <h1 
            className="text-base font-medium text-gray-900"
            style={{ fontFamily: page.defaultBoxFontFamily }}
          >
            {page.name}
          </h1>
          <p 
            className="text-sm text-gray-600"
            style={{ fontFamily: page.defaultBoxTitleFontFamily }}
          >
            {page.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const event = new CustomEvent('toggleNavigation');
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            title="Pokaż/ukryj menu"
          >
            ☰
          </button>
          <Link
            to={`/page/${page.slug}/edit`}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edytuj
          </Link>
        </div>
      </div>

      <div className="flex-1">
        <div className={`relative w-full h-[80vh] grid grid-cols-10 grid-rows-8 gap-${page.gap / 4} ${
          page.layout.length > 0 ? `
            ${page.theme === 'dark' ? 'bg-gray-900 text-white' : ''}
            ${page.theme === 'fantasy' ? 'bg-amber-50' : ''}
            ${page.theme === 'scifi' ? 'bg-slate-900 text-blue-100' : ''}
          ` : ''
        }`}
        style={{
          backgroundColor: page.backgroundColor || '#f3f4f6'
        }}>
          {/* Grid lines */}
          {page.showGrid && Array.from({ length: 80 }).map((_, index) => {
            const x = index % 10
            const y = Math.floor(index / 10)
            return (
              <div
                key={index}
                className={`border-r border-b border-dashed ${
                  page.theme === 'dark' ? 'border-gray-700' :
                  page.theme === 'fantasy' ? 'border-amber-200' :
                  page.theme === 'scifi' ? 'border-blue-800' :
                  'border-gray-300'
                }`}
                style={{
                  gridColumn: `${x + 1}`,
                  gridRow: `${y + 1}`,
                }}
              />
            )
          })}

          {/* Boxy */}
          {page.layout.map(box => {
            return (
              <Box 
                key={box.id} 
                box={box} 
                page={page}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PageView 