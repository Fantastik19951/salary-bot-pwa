import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box, Card, Stack, Typography, IconButton, Avatar, alpha } from '@mui/material'
import { MoreVert, DragIndicator, AttachMoney, Person, Delete, Edit } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { haptics } from '../utils/haptics'
import { useState } from 'react'

interface Entry {
  id: string
  symbols: string
  amount?: number
  salary?: number
  [key: string]: any
}

interface DraggableEntryCardProps {
  entry: Entry
  index: number
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>, entry: Entry) => void
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(Math.floor(amount))
}

export default function DraggableEntryCard({ entry, index, onMenuClick, onEdit, onDelete }: DraggableEntryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id })

  const [swipeX, setSwipeX] = useState(0)
  const [isDraggingHandle, setIsDraggingHandle] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSwipeDragEnd = (e: any, info: any) => {
    // Игнорируем если это драг handle
    if (isDraggingHandle) {
      setIsDraggingHandle(false)
      return
    }
    
    const swipeThreshold = 100
    if (info.offset.x > swipeThreshold) {
      // Свайп вправо → Удаление
      onDelete(entry)
      haptics.medium()
    } else if (info.offset.x < -swipeThreshold) {
      // Свайп влево → Редактирование
      onEdit(entry)
      haptics.light()
    }
    setSwipeX(0)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={{ ...style, position: 'relative' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Swipe actions background */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 0
        }}
      >
        <Box sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          p: 1,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Delete />
          <Typography variant="caption" fontWeight={700}>Удалить</Typography>
        </Box>
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          p: 1,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="caption" fontWeight={700}>Изменить</Typography>
          <Edit />
        </Box>
      </motion.div>

      {/* Main card with swipe */}
      <motion.div
        drag={!isDragging ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(e, info) => {
          if (!isDragging) {
            setSwipeX(info.offset.x)
            if (Math.abs(info.offset.x) > 50 && Math.abs(info.offset.x) < 52) {
              haptics.light()
            }
          }
        }}
        onDragEnd={handleSwipeDragEnd}
        style={{ 
          position: 'relative', 
          zIndex: 1,
          touchAction: 'pan-x'
        }}
      >
        <Card sx={{ mb: 1.5, bgcolor: 'white' }}>
          <Box p={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Drag Handle */}
              <Box
                {...attributes}
                {...listeners}
                onMouseDown={() => setIsDraggingHandle(true)}
                onTouchStart={() => setIsDraggingHandle(true)}
                sx={{
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  opacity: { xs: 1, md: 0.3 },
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <DragIndicator />
              </Box>

              {/* Avatar */}
              <Avatar sx={{ 
                bgcolor: entry.amount ? 'primary.main' : 'info.main',
                width: 44,
                height: 44
              }}>
                {entry.amount ? <AttachMoney /> : <Person />}
              </Avatar>

              {/* Info */}
              <Box flex={1}>
                <Typography variant="body1" fontWeight={700}>
                  {entry.symbols}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.amount ? 'Оборот' : 'Зарплата'}
                </Typography>
              </Box>

              {/* Amount */}
              <Box textAlign="right">
                <Typography variant="h5" fontWeight={900} color="primary">
                  {formatMoney(entry.amount || entry.salary || 0)} $
                </Typography>
                {entry.amount && (
                  <Typography variant="caption" color="text.secondary">
                    Заработок: {formatMoney(entry.amount * 0.10)} $
                  </Typography>
                )}
              </Box>
              
              {/* Menu */}
              <IconButton 
                size="small"
                onClick={(e) => onMenuClick(e, entry)}
              >
                <MoreVert />
              </IconButton>
            </Stack>
          </Box>
        </Card>
      </motion.div>
    </motion.div>
  )
}
