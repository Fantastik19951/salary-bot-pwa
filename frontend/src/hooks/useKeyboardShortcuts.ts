import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onAddEntry?: () => void
  onSearch?: () => void
  onEscape?: () => void
  onPrevMonth?: () => void
  onNextMonth?: () => void
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем если фокус в input/textarea
      const target = e.target as HTMLElement
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes(target.tagName)
      
      // Ctrl+N или Cmd+N - добавить запись
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && config.onAddEntry) {
        e.preventDefault()
        config.onAddEntry()
        return
      }
      
      // Ctrl+K или Cmd+K - поиск
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && config.onSearch) {
        e.preventDefault()
        config.onSearch()
        return
      }
      
      // / - быстрый поиск (только если не в input)
      if (e.key === '/' && !isInputFocused && config.onSearch) {
        e.preventDefault()
        config.onSearch()
        return
      }
      
      // Esc - закрыть модалки
      if (e.key === 'Escape' && config.onEscape) {
        config.onEscape()
        return
      }
      
      // ← - предыдущий месяц (только если не в input)
      if (e.key === 'ArrowLeft' && !isInputFocused && config.onPrevMonth) {
        e.preventDefault()
        config.onPrevMonth()
        return
      }
      
      // → - следующий месяц (только если не в input)
      if (e.key === 'ArrowRight' && !isInputFocused && config.onNextMonth) {
        e.preventDefault()
        config.onNextMonth()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [config])
}
