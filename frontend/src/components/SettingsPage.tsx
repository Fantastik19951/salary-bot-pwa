import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, alpha, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { ArrowBack, Palette, Notifications, Info, Policy, DeleteForever, FileDownload } from '@mui/icons-material'
import ThemeSettings from './ThemeSettings'
import ReminderSettings from './ReminderSettings'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'themes' | 'reminders' | 'about'>('themes')

  const menuItems = [
    { id: 'themes' as const, icon: <Palette />, label: 'Темы оформления' },
    { id: 'reminders' as const, icon: <Notifications />, label: 'Напоминания' },
    { id: 'about' as const, icon: <Info />, label: 'О приложении' },
  ]

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            bgcolor: alpha('#667eea', 0.1),
            '&:hover': { bgcolor: alpha('#667eea', 0.2) }
          }}
        >
          <ArrowBack sx={{ color: '#667eea' }} />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Настройки
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Персонализация приложения
          </Typography>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Sidebar Menu */}
        <Card sx={{ width: { xs: '100%', md: 280 }, height: 'fit-content' }}>
          <List>
            {menuItems.map((item, idx) => (
              <Box key={item.id}>
                {idx > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    sx={{
                      py: 2,
                      '&.Mui-selected': {
                        bgcolor: alpha('#667eea', 0.12),
                        '&:hover': {
                          bgcolor: alpha('#667eea', 0.18)
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: activeTab === item.id ? '#667eea' : 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: activeTab === item.id ? 700 : 500,
                        color: activeTab === item.id ? '#667eea' : 'text.primary'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>

          <Divider />

          <List>
            <ListItem disablePadding>
              <ListItemButton sx={{ py: 2 }}>
                <ListItemIcon>
                  <FileDownload />
                </ListItemIcon>
                <ListItemText primary="Экспорт данных" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ py: 2 }}>
                <ListItemIcon>
                  <DeleteForever />
                </ListItemIcon>
                <ListItemText primary="Очистить кэш" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ py: 2 }}>
                <ListItemIcon>
                  <Policy />
                </ListItemIcon>
                <ListItemText primary="Политика" />
              </ListItemButton>
            </ListItem>
          </List>
        </Card>

        {/* Content */}
        <Box flex={1}>
          <Card sx={{ p: 4 }}>
            {activeTab === 'themes' && (
              <ThemeSettings
                currentTheme={localStorage.getItem('app_theme') || 'default'}
                onThemeChange={(themeId) => {
                  localStorage.setItem('app_theme', themeId)
                  window.location.reload()
                }}
              />
            )}

            {activeTab === 'reminders' && <ReminderSettings />}

            {activeTab === 'about' && (
              <Box>
                <Typography variant="h5" fontWeight={700} mb={2}>
                  О приложении
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Версия
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      1.0.0
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Разработчик
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      Salary Bot Team
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Описание
                    </Typography>
                    <Typography variant="body1">
                      PWA приложение для учета зарплаты и оборота
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Card>
        </Box>
      </Stack>
    </Box>
  )
}
