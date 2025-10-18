import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Box, Card, Stack, Typography, Avatar, alpha } from '@mui/material'
import { DragIndicator, AttachMoney, Person } from '@mui/icons-material'
import { haptics } from '../utils/haptics'
import DraggableEntryCard from './DraggableEntryCard'

interface Entry {
  id: string
  symbols: string
  amount?: number
  salary?: number
  date: string
  [key: string]: any
}


interface DraggableEntryListProps {
  entries: Entry[]
  onReorder: (entries: Entry[]) => void
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>, entry: Entry) => void
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
}

export default function DraggableEntryList({ entries, onReorder, onMenuClick, onEdit, onDelete }: DraggableEntryListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Блокировка скролла во время драга
  useEffect(() => {
    if (activeId) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [activeId])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Требуется сдвиг на 8px для активации
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    haptics.light()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((entry) => entry.id === active.id)
      const newIndex = entries.findIndex((entry) => entry.id === over.id)

      const newEntries = arrayMove(entries, oldIndex, newIndex)
      onReorder(newEntries)
      haptics.medium()
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeEntry = entries.find((entry) => entry.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={entries.map(e => e.id)}
        strategy={verticalListSortingStrategy}
      >
        {entries.map((entry, index) => (
          <DraggableEntryCard
            key={entry.id}
            entry={entry}
            index={index}
            onMenuClick={onMenuClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeEntry ? (
          <Card
            sx={{
              opacity: 0.9,
              cursor: 'grabbing',
              boxShadow: 6
            }}
          >
            <Box p={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <DragIndicator sx={{ color: 'text.secondary' }} />
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: activeEntry.amount ? 'primary.main' : 'info.main'
                  }}
                >
                  {activeEntry.amount ? <AttachMoney /> : <Person />}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight={700}>
                    {activeEntry.symbols}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeEntry.amount ? 'Оборот' : 'Зарплата'}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h5" fontWeight={900} color="primary">
                    {(activeEntry.amount || activeEntry.salary || 0).toLocaleString()} $
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
