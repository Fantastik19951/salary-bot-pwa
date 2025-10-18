import { ReactNode, useRef, useState } from 'react'
import { Box, CircularProgress, alpha } from '@mui/material'
import { Refresh } from '@mui/icons-material'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface Props {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const y = useMotionValue(0)
  const rotate = useTransform(y, [0, 80], [0, 180])
  
  const handleDragEnd = async (event: any, info: any) => {
    setIsDragging(false)
    
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true)
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      
      try {
        await onRefresh()
      } finally {
        setTimeout(() => {
          setIsRefreshing(false)
        }, 500)
      }
    }
  }
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Индикатор pull-to-refresh */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          opacity: isRefreshing || isDragging ? 1 : 0,
          transition: 'opacity 0.2s'
        }}
      >
        {isRefreshing ? (
          <CircularProgress size={24} />
        ) : (
          <motion.div style={{ rotate }}>
            <Refresh sx={{ color: '#667eea' }} />
          </motion.div>
        )}
      </Box>
      
      {/* Контент */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ y, touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </Box>
  )
}
