import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PageBox {
  id: string;
  size: string;
  position: string; // format: "x,y"
  tableId: string | null;
  customTitle: string | null;
  backgroundColor: string | null;
  textColor: string | null;
}

export interface Page {
  id: string;
  name: string;
  description: string;
  slug: string;
  theme: string;
  borderRadius: number;
  gap: number;
  showGrid: boolean;
  backgroundColor: string;
  defaultBoxBackgroundColor: string;
  defaultBoxTextColor: string;
  defaultBoxBorderWidth: number;
  defaultBoxBorderColor: string;
  defaultBoxTextSize: number;
  defaultBoxFontFamily: string;
  defaultBoxTitleFontFamily: string;
  colorPalette: string[];
  useRandomColors: boolean;
  layout: PageBox[];
  owner: string;
  tags: string[];
}

interface PageState {
  pages: Page[];
  addPage: (page: Omit<Page, 'id'>) => void;
  updatePage: (id: string, page: Omit<Page, 'id'>) => void;
  getPages: () => Page[];
  getPageBySlug: (slug: string) => Page | undefined;
}

export const usePageStore = create<PageState>()(
  persist(
    (set, get) => ({
      pages: [],
      
      addPage: (pageData) => {
        const newPage = {
          ...pageData,
          id: Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          pages: [...state.pages, newPage]
        }));
      },

      updatePage: (id, pageData) => {
        set((state) => ({
          pages: state.pages.map(page => 
            page.id === id ? { ...pageData, id } : page
          )
        }));
      },

      getPages: () => get().pages,
      
      getPageBySlug: (slug) => get().pages.find(p => p.slug === slug)
    }),
    {
      name: 'pages-storage'
    }
  )
); 