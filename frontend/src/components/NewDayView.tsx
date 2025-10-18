import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, Avatar, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ToggleButtonGroup, ToggleButton, Menu, MenuItem, ListItemIcon, ListItemText, Chip } from '@mui/material'
import { ArrowBack, Add, AttachMoney, MoreVert, Edit, Delete, Person, CalendarToday, Warning } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { useAppStore } from '../store/appStore'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import UpdateIndicator from './UpdateIndicator'
import { haptics } from '../utils/haptics'
import DraggableEntryList from './DraggableEntryList'

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(Math.floor(amount))
}

export default function NewDayView() {
  const navigate = useNavigate()
  const { year, month, day } = useParams()
  const { entries, updateEntry, deleteEntry, syncData, addEntry } = useAppStore()
  
  const [editDialog, setEditDialog] = useState(false)
  const [editEntry, setEditEntry] = useState<any>(null)
  const [editType, setEditType] = useState<'amount' | 'salary'>('amount')
  const [editClient, setEditClient] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  
  // Состояния для добавления
  const [addDialog, setAddDialog] = useState(false)
  const [addType, setAddType] = useState<'amount' | 'salary'>('amount')
  const [addClient, setAddClient] = useState('')
  const [addAmount, setAddAmount] = useState('')
  
  // Индикатор обновления
  const [updating, setUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const dateStr = `${day?.padStart(2, '0')}.${month?.padStart(2, '0')}.${year}`
  const periodKey = `${year}-${month?.padStart(2, '0')}`
  
  const dayData = useMemo(() => {
    const periodEntries = entries[periodKey] || []
    const dayEntries = periodEntries.filter((e: any) => e.date === dateStr)
    
    // Добавляем уникальный id если его нет
    const entriesWithId = dayEntries.map((e: any, idx: number) => ({
      ...e,
      id: e.row_idx?.toString() || `temp-${idx}`
    }))
    
    const revenues = entriesWithId.filter((e: any) => e.amount)
    const salaries = entriesWithId.filter((e: any) => e.salary)
    
    const totalRevenue = revenues.reduce((sum: any, e: any) => sum + e.amount, 0)
    const totalSalary = salaries.reduce((sum: any, e: any) => sum + e.salary, 0)
    const earnings = totalRevenue * 0.10
    
    return {
      revenues,
      salaries,
      totalRevenue,
      totalSalary,
      earnings,
      all: entriesWithId
    }
  }, [entries, periodKey, dateStr])

  const dateFormatted = useMemo(() => {
    const [d, m, y] = dateStr.split('.').map(Number)
    const date = new Date(y, m - 1, d)
    return format(date, 'd MMMM yyyy, EEEE', { locale: ru })
  }, [dateStr])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, entry: any) => {
    setAnchorEl(event.currentTarget)
    setSelectedEntry(entry)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedEntry(null)
  }

  const handleEdit = (entry?: any) => {
    const entryToEdit = entry || selectedEntry
    if (entryToEdit) {
      haptics.light()
      setEditEntry(entryToEdit)
      setEditType(entryToEdit.amount ? 'amount' : 'salary')
      setEditClient(entryToEdit.symbols || '')
      setEditAmount(String(entryToEdit.amount || entryToEdit.salary || ''))
      setEditDialog(true)
    }
    handleMenuClose()
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return
    
    setDeleteDialog(false)
    handleMenuClose()
    setUpdating(true)
    haptics.medium()
    
    try {
      console.log('Deleting entry:', periodKey, selectedEntry.row_idx)
      await deleteEntry(periodKey, selectedEntry.row_idx)
      await new Promise(resolve => setTimeout(resolve, 300))
      await syncData()
      setUpdating(false)
      setUpdateSuccess(true)
      haptics.success()
      setTimeout(() => setUpdateSuccess(false), 2000)
    } catch (error) {
      console.error('Delete error:', error)
      setUpdating(false)
      haptics.error()
    }
  }
  
  const handleDeleteSwipe = (entry: any) => {
    haptics.medium()
    setSelectedEntry(entry)
    setDeleteDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editClient || !editAmount || !editEntry) return

    const updatedEntry: any = {
      ...editEntry,
      symbols: editClient,
      date: dateStr
    }

    if (editType === 'amount') {
      updatedEntry.amount = parseFloat(editAmount)
      delete updatedEntry.salary
    } else {
      updatedEntry.salary = parseFloat(editAmount)
      delete updatedEntry.amount
    }

    setUpdating(true)
    setEditDialog(false)
    setEditEntry(null)
    
    await updateEntry(periodKey, editEntry.row_idx, updatedEntry)
    await syncData()
    setUpdating(false)
    setUpdateSuccess(true)
    setTimeout(() => setUpdateSuccess(false), 2000)
  }

  const handleSaveAdd = async () => {
    if (!addClient || !addAmount) return
    
    const newEntry: any = {
      date: dateStr,
      symbols: addClient
    }
    
    if (addType === 'amount') {
      newEntry.amount = parseFloat(addAmount)
    } else {
      newEntry.salary = parseFloat(addAmount)
    }
    
    setUpdating(true)
    setAddDialog(false)
    setAddClient('')
    setAddAmount('')
    setAddType('amount')
    
    try {
      await addEntry(newEntry)
      await syncData()
      setUpdating(false)
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding entry:', error)
      setUpdating(false)
    }
  }

  const handleReorder = async (reorderedEntries: any[]) => {
    try {
      // Обновляем порядок записей в store
      const periodEntries = entries[periodKey] || []
      const otherEntries = periodEntries.filter((e: any) => e.date !== dateStr)
      
      // Создаем новый массив с обновленными индексами
      const updatedEntries = reorderedEntries.map((entry, index) => ({
        ...entry,
        order_index: index
      }))
      
      // Объединяем записи этого дня с остальными записями месяца
      const newPeriodEntries = [...otherEntries, ...updatedEntries]
      
      // Обновляем store
      useAppStore.setState((state) => ({
        entries: {
          ...state.entries,
          [periodKey]: newPeriodEntries
        }
      }))
      
      // Синхронизируем с сервером
      await syncData()
      haptics.success()
    } catch (error) {
      console.error('Error reordering entries:', error)
    }
  }

  return (
    <Box>
      <UpdateIndicator loading={updating} success={updateSuccess} />
      
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
        <Box flex={1}>
          <Typography variant="h5" fontWeight={800}>
            {dateFormatted}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayData.all.length} записей за день
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          Добавить
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
        <motion.div style={{ flex: 1 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
            <Box p={3} height="100%">
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" height="100%">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Оборот
                  </Typography>
                  <Typography variant="h3" fontWeight={900}>
                    <CountUp end={dayData.totalRevenue} duration={2} separator=" " /> $
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    {dayData.revenues.length} транзакций
                  </Typography>
                </Box>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AttachMoney sx={{ fontSize: 28 }} />
                </Avatar>
              </Stack>
            </Box>
          </Card>
        </motion.div>

        <motion.div style={{ flex: 1 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
            <Box p={3} height="100%">
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" height="100%">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Заработок (10%)
                  </Typography>
                  <Typography variant="h3" fontWeight={900}>
                    <CountUp end={dayData.earnings} duration={2} separator=" " decimals={2} /> $
                  </Typography>
                </Box>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AttachMoney sx={{ fontSize: 28 }} />
                </Avatar>
              </Stack>
            </Box>
          </Card>
        </motion.div>

        {dayData.totalSalary > 0 && (
          <motion.div style={{ flex: 1 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
              <Box p={3} height="100%">
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Выплаты ЗП
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      <CountUp end={dayData.totalSalary} duration={2} separator=" " /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        )}
      </Stack>

      {/* Entries List */}
      <Card>
        <Box p={3}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Записи дня
          </Typography>
          
          {dayData.all.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">Нет записей</Typography>
              <Button 
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate(`/add?date=${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`)}
                sx={{ 
                  mt: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                Добавить запись
              </Button>
            </Box>
          ) : (
            <DraggableEntryList
              entries={dayData.all}
              onReorder={handleReorder}
              onMenuClick={handleMenuClick}
              onEdit={handleEdit}
              onDelete={handleDeleteSwipe}
            />
          )}
        </Box>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 180 }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteSwipe(selectedEntry); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Редактировать запись
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <ToggleButtonGroup
              value={editType}
              exclusive
              onChange={(e, val) => val && setEditType(val)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  py: 1.5,
                  border: '2px solid',
                  borderColor: alpha('#667eea', 0.2),
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: '2px solid transparent'
                  }
                }
              }}
            >
              <ToggleButton value="amount">💰 Оборот</ToggleButton>
              <ToggleButton value="salary">💵 Зарплата</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              fullWidth
              label={editType === 'amount' ? 'Клиент' : 'Описание'}
              value={editClient}
              onChange={(e) => setEditClient(e.target.value)}
            />

            <TextField
              fullWidth
              label="Сумма ($)"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialog(false)} size="large">
            Отмена
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editClient || !editAmount}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog добавления */}
      <Dialog 
        open={addDialog} 
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Add sx={{ color: '#667eea' }} />
            <Typography variant="h6" fontWeight={700}>
              Добавить запись на {dateStr}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <ToggleButtonGroup
              value={addType}
              exclusive
              onChange={(e, val) => val && setAddType(val)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  py: 1.5,
                  border: '2px solid',
                  borderColor: alpha('#667eea', 0.2),
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: '2px solid transparent'
                  }
                }
              }}
            >
              <ToggleButton value="amount">💰 Оборот</ToggleButton>
              <ToggleButton value="salary">💵 Зарплата</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              fullWidth
              label={addType === 'amount' ? 'Клиент' : 'Описание'}
              value={addClient}
              onChange={(e) => setAddClient(e.target.value)}
              autoFocus
            />

            <TextField
              fullWidth
              label="Сумма ($)"
              type="number"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddDialog(false)} size="large">
            Отмена
          </Button>
          <Button 
            onClick={handleSaveAdd}
            variant="contained"
            disabled={!addClient || !addAmount}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4
            }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: alpha('#f44336', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <Warning sx={{ fontSize: 40, color: 'error.main' }} />
          </Box>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Удалить запись?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {selectedEntry && (
              <>
                <strong>{selectedEntry.symbols}</strong> • {formatMoney(selectedEntry.amount || selectedEntry.salary)} $
              </>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Это действие нельзя отменить
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialog(false)}
            fullWidth
            size="large"
            sx={{
              borderRadius: 2,
              py: 1.25
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            fullWidth
            size="large"
            sx={{
              borderRadius: 2,
              py: 1.25,
              fontWeight: 700
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
