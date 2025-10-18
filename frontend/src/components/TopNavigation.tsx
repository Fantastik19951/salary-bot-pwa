import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Tabs, Tab, AppBar, Toolbar, IconButton, Badge, alpha } from '@mui/material'
import { Home, CalendarMonth, Add, Assessment, People, Search, Notifications, LightMode, DarkMode, Settings } from '@mui/icons-material'
import { haptics } from '../utils/haptics'
import { useState } from 'react'

interface TopNavigationProps {
  darkMode: boolean
  onToggleTheme: () => void
  onSearch: () => void
}

export default function TopNavigation({ darkMode, onToggleTheme, onSearch }: TopNavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications] = useState(3)
  
  const getCurrentTab = () => {
    const path = location.pathname
    if (path === '/') return 0
    if (path.startsWith('/year') || path.startsWith('/month') || path.startsWith('/day')) return 1
    if (path.startsWith('/add')) return 2
    if (path.startsWith('/kpi')) return 3
    if (path.startsWith('/clients')) return 4
    return 0
  }
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    haptics.light()
    const routes = ['/', `/year/${new Date().getFullYear()}`, '/add', '/kpi/current', '/clients']
    navigate(routes[newValue])
  }
  
  const handleSearch = () => {
    haptics.light()
    onSearch()
  }
  
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        display: { xs: 'block', md: 'none' }, // Скрываем на desktop
        background: darkMode ? 'linear-gradient(135deg, #333 0%, #555 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid',
        borderColor: alpha('#fff', 0.1)
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
        {/* Navigation Tabs */}
        <Tabs 
          value={getCurrentTab()} 
          onChange={handleTabChange}
          sx={{
            flex: 1,
            minHeight: { xs: 48, sm: 56 },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              color: alpha('#fff', 0.7),
              minWidth: { xs: 60, sm: 100 },
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 1, sm: 2 },
              '&.Mui-selected': {
                color: 'white',
                fontWeight: 700
              },
              '&:hover': {
                color: 'white',
                bgcolor: alpha('#fff', 0.1)
              }
            }
          }}
        >
          <Tab icon={<Home />} label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Главная</Box>} iconPosition="start" />
          <Tab icon={<CalendarMonth />} label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Календарь</Box>} iconPosition="start" />
          <Tab 
            icon={
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: alpha('#fff', 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Add />
              </Box>
            } 
            label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Добавить</Box>} 
            iconPosition="start" 
          />
          <Tab icon={<Assessment />} label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>KPI</Box>} iconPosition="start" />
          <Tab icon={<People />} label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Клиенты</Box>} iconPosition="start" />
        </Tabs>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
          <IconButton 
            onClick={handleSearch}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: alpha('#fff', 0.1) }
            }}
          >
            <Search />
          </IconButton>
          
          <IconButton 
            onClick={() => navigate('/settings')}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: alpha('#fff', 0.1) }
            }}
          >
            <Settings />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
