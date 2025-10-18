import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Entry {
  date: string
  symbols: string
  row_idx?: number
  amount?: number
  salary?: number
}

interface AppState {
  entries: Record<string, Entry[]>
  ws: WebSocket | null
  isOnline: boolean
  pendingActions: any[]
  
  setEntries: (entries: Record<string, Entry[]>) => void
  connectWebSocket: () => void
  syncData: () => Promise<void>
  addEntry: (entry: Entry) => Promise<void>
  updateEntry: (period: string, rowIdx: number, entry: Entry) => Promise<void>
  deleteEntry: (period: string, rowIdx: number) => Promise<void>
  addPendingAction: (action: any) => void
  processPendingActions: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      entries: {},
      ws: null,
      isOnline: navigator.onLine,
      pendingActions: [],

      setEntries: (entries) => set({ entries }),

      connectWebSocket: () => {
        try {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
          const wsUrl = `${protocol}//${window.location.host}/ws`
          console.log('🔌 Подключаем WebSocket:', wsUrl)
          
          const ws = new WebSocket(wsUrl)

          ws.onopen = () => {
            console.log('✅ WebSocket подключен')
            set({ isOnline: true })
            get().processPendingActions()
          }

          ws.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data)
              console.log('📨 WebSocket сообщение:', message.type)
              
              if (message.type === 'init' || message.type === 'sync') {
                set({ entries: message.data })
              }
            } catch (error) {
              console.error('❌ Ошибка парсинга WS сообщения:', error)
            }
          }

          ws.onclose = () => {
            console.log('❌ WebSocket отключен')
            set({ isOnline: false, ws: null })
            setTimeout(() => {
              console.log('🔄 Переподключение WebSocket...')
              get().connectWebSocket()
            }, 3000)
          }

          ws.onerror = (error) => {
            console.error('❌ WebSocket ошибка:', error)
            set({ isOnline: false })
          }

          set({ ws })
        } catch (error) {
          console.error('❌ Ошибка создания WebSocket:', error)
          set({ isOnline: false, ws: null })
        }
      },

      syncData: async () => {
        try {
          console.log('🔄 Синхронизация данных...')
          const response = await fetch('/api/entries')
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log('✅ Данные загружены:', Object.keys(data.data || {}).length, 'периодов')
          set({ entries: data.data, isOnline: true })
        } catch (error) {
          console.error('❌ Ошибка синхронизации:', error)
          set({ isOnline: false })
          throw error
        }
      },

      addEntry: async (entry) => {
        const { ws, isOnline, syncData } = get()
        
        if (isOnline && ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'add_entry',
            data: entry
          }))
          // Ждем немного и синхронизируем
          setTimeout(() => syncData(), 500)
        } else {
          get().addPendingAction({ type: 'add_entry', data: entry })
        }
      },

      updateEntry: async (period, rowIdx, entry) => {
        const { ws, isOnline } = get()
        
        console.log('updateEntry called:', { period, rowIdx, entry })
        
        if (isOnline && ws?.readyState === WebSocket.OPEN) {
          const message = {
            type: 'update_entry',
            idx: rowIdx,
            symbols: entry.symbols,
            amount: entry.amount || entry.salary
          }
          console.log('Sending update via WebSocket:', message)
          ws.send(JSON.stringify(message))
        } else {
          get().addPendingAction({ type: 'update_entry', idx: rowIdx, symbols: entry.symbols, amount: entry.amount || entry.salary })
        }
        
        // Локальное обновление
        set((state) => {
          const periodEntries = [...(state.entries[period] || [])]
          const index = periodEntries.findIndex((e: any) => e.row_idx === rowIdx)
          if (index !== -1) {
            periodEntries[index] = { ...entry, row_idx: rowIdx }
          }
          return {
            entries: {
              ...state.entries,
              [period]: periodEntries
            }
          }
        })
      },

      deleteEntry: async (period, rowIdx) => {
        const { ws, isOnline } = get()
        
        console.log('deleteEntry called:', { period, rowIdx })
        
        if (isOnline && ws?.readyState === WebSocket.OPEN) {
          const message = {
            type: 'delete_entry',
            idx: rowIdx  // ⬅️ Backend ожидает idx напрямую
          }
          console.log('Sending delete via WebSocket:', message)
          ws.send(JSON.stringify(message))
        } else {
          get().addPendingAction({ type: 'delete_entry', idx: rowIdx })
        }
        
        // Локальное удаление
        set((state) => {
          const periodEntries = (state.entries[period] || []).filter((e: any) => e.row_idx !== rowIdx)
          return {
            entries: {
              ...state.entries,
              [period]: periodEntries
            }
          }
        })
      },

      addPendingAction: (action) => {
        set((state) => ({
          pendingActions: [...state.pendingActions, action]
        }))
      },

      processPendingActions: async () => {
        const { pendingActions, ws } = get()
        
        if (!ws || ws.readyState !== WebSocket.OPEN) return
        
        for (const action of pendingActions) {
          ws.send(JSON.stringify(action))
        }
        
        set({ pendingActions: [] })
      }
    }),
    {
      name: 'salary-bot-storage',
      partialize: (state) => ({
        entries: state.entries,
        pendingActions: state.pendingActions
      })
    }
  )
)
