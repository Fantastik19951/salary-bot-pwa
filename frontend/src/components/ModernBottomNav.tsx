import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Paper, alpha } from '@mui/material'
import { Home, CalendarMonth, Assessment, People, Add } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'Главная', path: '/', icon: Home },
  { label: 'Календарь', path: '/month', icon: CalendarMonth, dynamicPath: true },
  { label: 'Добавить', path: '/add', icon: Add },
  { label: 'KPI', path: '/kpi/current', icon: Assessment },
  { label: 'Клиенты', path: '/clients', icon: People },
]

export default function ModernBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const currentPath = navItems.findIndex(item => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  })

  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        pb: 'env(safe-area-inset-bottom)'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        alignItems: 'stretch',
        position: 'relative',
        height: 64
      }}>
        {navItems.map((item, index) => {
          const active = currentPath === index
          const Icon = item.icon
          
          return (
            <Box
              key={item.path}
              onClick={() => {
                if (item.dynamicPath) {
                  navigate(`/month/${new Date().getFullYear()}/${new Date().getMonth() + 1}`)
                } else {
                  navigate(item.path)
                }
              }}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                gap: 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }}
            >
              <AnimatePresence>
                {active && (
                  <>
                    {/* Top indicator bar */}
                    <motion.div
                      layoutId="topBar"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '20%',
                        right: '20%',
                        height: 3,
                        borderRadius: '0 0 3px 3px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                    
                    {/* Background glow */}
                    <motion.div
                      layoutId="activeGlow"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, ${alpha('#667eea', 0.1)} 0%, ${alpha('#764ba2', 0.1)} 100%)`,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  y: active ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <Icon sx={{ 
                  fontSize: active ? 26 : 24,
                  color: active ? '#667eea' : 'text.secondary',
                  filter: active ? 'drop-shadow(0 2px 8px rgba(102, 126, 234, 0.3))' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  scale: active ? 1 : 0.9,
                  opacity: active ? 1 : 0.7
                }}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#667eea' : '#9e9e9e',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {item.label}
              </motion.span>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
