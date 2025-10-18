import { useState, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Stack, Typography, alpha, useMediaQuery, useTheme, Divider } from '@mui/material'
import { Home, History, People, BarChart, Add, Settings, Menu, ChevronLeft, Search } from '@mui/icons-material'

interface DesktopLayoutProps {
  children: ReactNode
  onSearchOpen?: () => void
}

const DRAWER_WIDTH = 260

export default function DesktopLayout({ children, onSearchOpen }: DesktopLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [open, setOpen] = useState(true)

  const menuItems = [
    { icon: <Home />, label: 'Главная', path: '/' },
    { icon: <History />, label: 'История', path: '/history' },
    { icon: <People />, label: 'Клиенты', path: '/clients' },
    { icon: <BarChart />, label: 'Аналитика', path: '/kpi/day' },
  ]

  const actionItems = [
    { icon: <Add />, label: 'Добавить', path: '/add' },
    { icon: <Search />, label: 'Поиск', action: onSearchOpen },
  ]

  if (!isDesktop) {
    return <Box>{children}</Box>
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : 72,
          flexShrink: 0,
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : 72,
            boxSizing: 'border-box',
            borderRight: `1px solid ${alpha('#000', 0.08)}`,
            transition: 'width 0.3s',
            overflowX: 'hidden'
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
          {open && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={800} color="white">
                  S
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Salary Bot
              </Typography>
            </Stack>
          )}
          <IconButton onClick={() => setOpen(!open)} size="small">
            {open ? <ChevronLeft /> : <Menu />}
          </IconButton>
        </Box>

        <Divider />

        {/* Main Menu */}
        <List sx={{ px: 1, pt: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    bgcolor: isActive ? alpha('#667eea', 0.12) : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? alpha('#667eea', 0.18) : alpha('#667eea', 0.08)
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? '#667eea' : 'text.secondary'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#667eea' : 'text.primary'
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <List sx={{ px: 1 }}>
          {actionItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => item.action ? item.action() : item.path && navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&:hover': {
                    bgcolor: alpha('#667eea', 0.08)
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: 'text.secondary'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        {/* Settings at bottom */}
        <List sx={{ px: 1, pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate('/settings')}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  bgcolor: alpha('#667eea', 0.08)
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}
              >
                <Settings />
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary="Настройки"
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 0 },
          width: { md: `calc(100% - ${open ? DRAWER_WIDTH : 72}px)` },
          transition: 'width 0.3s'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
