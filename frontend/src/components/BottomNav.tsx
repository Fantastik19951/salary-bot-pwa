import { useNavigate, useLocation } from 'react-router-dom'
import { Box, IconButton, Stack, Typography, Paper, alpha } from '@mui/material'
import { Home, Add, Assessment, History } from '@mui/icons-material'
import { motion } from 'framer-motion'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { icon: <Home />, label: 'Главная', path: '/' },
    { icon: <Add />, label: 'Добавить', path: '/add' },
    { icon: <Assessment />, label: 'KPI', path: '/kpi/current' },
    { icon: <History />, label: 'История', path: '/history' }
  ]

  return (
    <Paper 
      elevation={24}
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderTop: `1px solid ${alpha('#000', 0.08)}`,
        backdropFilter: 'blur(20px)',
        bgcolor: alpha('#fff', 0.9)
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Stack direction="row" justifyContent="space-around" alignItems="center">
          {navItems.map((item, index) => {
            const active = isActive(item.path)
            return (
              <IconButton
                key={index}
                onClick={() => navigate(item.path)}
                sx={{
                  flexDirection: 'column',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  gap: 0.5,
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 12,
                      zIndex: -1
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Box sx={{ color: active ? 'white' : 'text.secondary' }}>
                  {item.icon}
                </Box>
                <Typography 
                  variant="caption" 
                  fontWeight={active ? 700 : 500}
                  sx={{ 
                    color: active ? 'white' : 'text.secondary',
                    fontSize: '0.7rem'
                  }}
                >
                  {item.label}
                </Typography>
              </IconButton>
            )
          })}
        </Stack>
      </Box>
    </Paper>
  )
}
