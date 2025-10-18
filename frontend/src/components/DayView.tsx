import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography, IconButton, Stack, List, ListItem, ListItemText, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { ArrowBack, Home, Delete, Edit, Add } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'

const formatAmount = (x: number): string => {
  if (Math.abs(x - Math.floor(x)) < 1e-9) {
    return Math.floor(x).toLocaleString('ru-RU')
  }
  return x.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const getAmountIcon = (amount: number) => {
  if (amount > 2000) return '🚀'
  if (amount > 1000) return '🔥'
  if (amount > 500) return '⭐'
  return '🔸'
}

export default function DayView() {
  const { year, month, day } = useParams()
  const navigate = useNavigate()
  const { entries, deleteEntry, updateEntry } = useAppStore()
  const [editDialog, setEditDialog] = useState<any>(null)
  const [editSymbols, setEditSymbols] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const dateStr = `${day!.padStart(2, '0')}.${month!.padStart(2, '0')}.${year}`
  const periodKey = `${year}-${month!.padStart(2, '0')}`

  const { dayEntries, total, average } = useMemo(() => {
    const dayEntries = (entries[periodKey] || [])
      .filter(e => e.date === dateStr && e.amount)
    
    const total = dayEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
    const average = dayEntries.length > 0 ? total / dayEntries.length : 0

    return { dayEntries, total, average }
  }, [entries, periodKey, dateStr])

  const handleDelete = (idx: number) => {
    if (window.confirm('Удалить запись?')) {
      deleteEntry(periodKey, idx)
    }
  }

  const handleEdit = (entry: any) => {
    setEditDialog(entry)
    setEditSymbols(entry.symbols)
    setEditAmount(String(entry.amount))
  }

  const handleSaveEdit = () => {
    if (editDialog && editSymbols && editAmount) {
      const updatedEntry = {
        ...editDialog,
        symbols: editSymbols,
        amount: parseFloat(editAmount)
      }
      updateEntry(periodKey, editDialog.row_idx, updatedEntry)
      setEditDialog(null)
    }
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700 }}>
          🗓️ {dateStr}
        </Typography>
        <IconButton onClick={() => navigate('/')} color="primary">
          <Home />
        </IconButton>
      </Box>

      <Card>
        <CardContent>
          {dayEntries.length === 0 ? (
            <Typography align="center" color="text.secondary">
              📭 Нет записей
            </Typography>
          ) : (
            <List>
              {dayEntries.map((entry, idx) => (
                <Box key={entry.row_idx}>
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleEdit(entry)}
                          sx={{ mr: 1 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          size="small"
                          color="error"
                          onClick={() => handleDelete(entry.row_idx)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1">
                          {getAmountIcon(entry.amount!)} {idx + 1}. {entry.symbols}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          {formatAmount(entry.amount!)} $
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < dayEntries.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {dayEntries.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={700}>💰 Итого:</Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  {formatAmount(total)} $
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">📊 Среднее:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatAmount(average)} $
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Button
        fullWidth
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate(`/add?date=${dateStr}`)}
      >
        ➕ Добавить запись
      </Button>

      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)}>
        <DialogTitle>✏️ Редактировать запись</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField
              fullWidth
              label="Название"
              value={editSymbols}
              onChange={(e) => setEditSymbols(e.target.value)}
            />
            <TextField
              fullWidth
              label="Сумма"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Отмена</Button>
          <Button onClick={handleSaveEdit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
