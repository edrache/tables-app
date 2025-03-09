import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TableItem {
  item: string;
  weight: number;
}

export interface Table {
  id: string;
  name: string;
  description: string;
  items: TableItem[];
  tags: string[];
  owner: string;
}

interface TableState {
  tables: Table[];
  addTable: (table: Omit<Table, 'id'>) => void;
  rollOnTable: (tableId: string) => TableItem | null;
  getTables: () => Table[];
  getTableById: (id: string) => Table | undefined;
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      tables: [],
      
      addTable: (tableData) => {
        const newTable = {
          ...tableData,
          id: Math.random().toString(36).substr(2, 9)
        };
        set((state) => ({
          tables: [...state.tables, newTable]
        }));
      },

      rollOnTable: (tableId) => {
        const table = get().tables.find(t => t.id === tableId);
        if (!table) return null;

        const totalWeight = table.items.reduce((sum, item) => sum + item.weight, 0);
        let roll = Math.random() * totalWeight;
        
        for (const item of table.items) {
          roll -= item.weight;
          if (roll <= 0) {
            return item;
          }
        }
        
        return table.items[table.items.length - 1];
      },

      getTables: () => get().tables,
      
      getTableById: (id) => get().tables.find(t => t.id === id)
    }),
    {
      name: 'tables-storage'
    }
  )
); 