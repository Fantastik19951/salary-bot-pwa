import { useEffect, useMemo, useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Box, Container, ThemeProvider, CssBaseline, Fab } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useAppStore } from './store/appStore'
import { ErrorBoundary } from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import HomePage from './components/HomePage'
import CompactAddEntry from './components/CompactAddEntry'
import QuickAddEntry from './components/QuickAddEntry'
import BulkAddEntry from './components/BulkAddEntry'
import ImprovedKPIView from './components/ImprovedKPIView'
import NewHistoryView from './components/NewHistoryView'
import CompactClientsPage from './components/CompactClientsPage'
import NewDayView from './components/NewDayView'
import CompactYearView from './components/CompactYearView'
import CompactMonthView from './components/CompactMonthView'
import TopNavigation from './components/TopNavigation'
import LoginScreen from './components/LoginScreen'
import GlobalSearch from './components/GlobalSearch'
import SmartSearch from './components/SmartSearch'
import WidgetToday from './components/WidgetToday'
import WidgetMonth from './components/WidgetMonth'
import SettingsPage from './components/SettingsPage'
import DesktopLayout from './components/DesktopLayout'
import { lightTheme, darkTheme } from './theme/darkTheme'
import { createAppTheme } from './theme/themes'
import { scheduleNotifications, requestNotificationPermission } from './utils/notifications'

// Внутренний компонент с роутингом
function AppContent({ darkMode, onToggleTheme, searchOpen, setSearchOpen, smartSearchOpen, setSmartSearchOpen }: any) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Глобальные keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Игнорируем если фокус в input/textarea
      const target = e.target as HTMLElement
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes(target.tagName)
      
      // Ctrl+N или Cmd+N - добавить запись
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        navigate('/add')
        return
      }
      
      // Ctrl+K или Cmd+K - умный поиск
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSmartSearchOpen(true)
        return
      }
      
      // / - глобальный поиск
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault()
        setSearchOpen(true)
        return
      }
      
      // Esc - закрыть поиск
      if (e.key === 'Escape') {
        if (smartSearchOpen) setSmartSearchOpen(false)
        if (searchOpen) setSearchOpen(false)
        return
      }
      
      // Ctrl+H или Cmd+H - история
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        navigate('/history')
        return
      }
      
      // Ctrl+S или Cmd+S - сохранить (предотвращаем стандартное поведение)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // Триггерим событие сохранения
        window.dispatchEvent(new CustomEvent('app:save'))
        return
      }
      
      // Ctrl+E или Cmd+E - редактировать (если на странице с записью)
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !isInputFocused) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('app:edit'))
        return
      }
      
      // Ctrl+D или Cmd+D - удалить (если на странице с записью)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !isInputFocused) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('app:delete'))
        return
      }
    }
    
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [navigate, searchOpen, setSearchOpen, smartSearchOpen, setSmartSearchOpen])
  
  // Показываем FAB только если не на странице добавления
  const showFab = location.pathname !== '/add'
  
  return (
    <DesktopLayout onSearchOpen={() => setSmartSearchOpen(true)}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', transition: 'background-color 0.3s ease', touchAction: 'manipulation' }}>
        <TopNavigation darkMode={darkMode} onToggleTheme={onToggleTheme} onSearch={() => setSmartSearchOpen(true)} />
      
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, md: 2 }, maxWidth: { xs: '100%', md: 'none' }, mx: 'auto' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/clients" element={<CompactClientsPage />} />
          <Route path="/year/:year" element={<CompactYearView />} />
          <Route path="/month/:year/:month" element={<CompactMonthView />} />
          <Route path="/day/:year/:month/:day" element={<NewDayView />} />
          <Route path="/kpi/:type" element={<ImprovedKPIView />} />
          <Route path="/history" element={<NewHistoryView />} />
          <Route path="/add" element={<QuickAddEntry />} />
          <Route path="/add/classic" element={<CompactAddEntry />} />
          <Route path="/add/bulk" element={<BulkAddEntry />} />
          <Route path="/widget/today" element={<WidgetToday />} />
          <Route path="/widget/month" element={<WidgetMonth />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      
      {/* FAB кнопка для быстрого добавления */}
      {showFab && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/add')}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 24 },
            right: { xs: 16, sm: 24 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
            },
            zIndex: 1000
          }}
        >
          <Add />
        </Fab>
      )}
      
      {/* Глобальный поиск */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Умный поиск */}
      <SmartSearch open={smartSearchOpen} onClose={() => setSmartSearchOpen(false)} />
      </Box>
    </DesktopLayout>
  )
}

function App() {
  const { connectWebSocket, syncData } = useAppStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [smartSearchOpen, setSmartSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  useEffect(() => {
    const initApp = async () => {
      try {
        const auth = localStorage.getItem('salary_app_auth')
        setIsAuthenticated(auth === 'true')
        
        if (auth === 'true') {
          connectWebSocket()
          await syncData()
          
          // Инициализировать уведомления
          const remindersEnabled = localStorage.getItem('reminders_enabled') === 'true'
          if (remindersEnabled) {
            await requestNotificationPermission()
            scheduleNotifications()
          }
        }
      } catch (error) {
        console.error('Ошибка инициализации:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initApp()
  }, [connectWebSocket, syncData])
  
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(syncData, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, syncData])
  
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false')
  }, [darkMode])

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault()
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '=')) {
        event.preventDefault()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    connectWebSocket()
    syncData()
  }

  const handleToggleTheme = () => {
    setDarkMode(prev => !prev)
  }

  const theme = useMemo(() => {
    const themeId = localStorage.getItem('app_theme') || (darkMode ? 'dark' : 'default')
    return createAppTheme(themeId)
  }, [darkMode])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginScreen onLogin={handleLogin} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent 
          darkMode={darkMode} 
          onToggleTheme={handleToggleTheme}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          smartSearchOpen={smartSearchOpen}
          setSmartSearchOpen={setSmartSearchOpen}
        />
        
      </BrowserRouter>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
