import { useState, useMemo } from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box, Typography, Chip, InputAdornment, IconButton } from '@mui/material'
import { Search, Close, AttachMoney, Person, CalendarMonth } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { haptics } from '../utils/haptics'

interface Props {
  open: boolean
  onClose: () => void
}

export default function GlobalSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { entries } = useAppStore()
  
  const results = useMemo(() => {
    if (!query || query.length < 2) return []
    
    const searchResults: any[] = []
    const queryLower = query.toLowerCase()
    
    // Поиск по всем записям
    Object.entries(entries).forEach(([period, periodEntries]) => {
      periodEntries.forEach((entry: any) => {
        const symbols = entry.symbols?.toLowerCase() || ''
        const date = entry.date || ''
        
        if (symbols.includes(queryLower) || date.includes(query)) {
          searchResults.push({
            ...entry,
            period,
            type: entry.amount ? 'revenue' : 'salary'
          })
        }
      })
    })
    
    return searchResults.slice(0, 20) // Лимит 20 результатов
  }, [query, entries])
  
  const handleSelect = (result: any) => {
    haptics.light()
    const [day, month, year] = result.date.split('.')
    navigate(`/day/${year}/${parseInt(month)}/${parseInt(day)}`)
    onClose()
  }
  
  const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(Math.floor(amount))
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Search sx={{ color: 'text.secondary' }} />
          <Typography variant="h6" fontWeight={700} flex={1}>
            Поиск
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          placeholder="Имя клиента или дата..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
        
        {query && results.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              Ничего не найдено
            </Typography>
          </Box>
        )}
        
        <List>
          {results.map((result, idx) => (
            <ListItem
              key={idx}
              button
              onClick={() => handleSelect(result)}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: result.type === 'revenue' ? 'primary.main' : 'info.main' 
                }}>
                  {result.type === 'revenue' ? <AttachMoney /> : <Person />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={result.symbols}
                secondary={
                  <Box component="span" display="flex" alignItems="center" gap={1}>
                    <CalendarMonth sx={{ fontSize: 14 }} />
                    {result.date}
                  </Box>
                }
              />
              <Box textAlign="right">
                <Typography variant="h6" fontWeight={700} color="primary">
                  {formatMoney(result.amount || result.salary)} $
                </Typography>
                <Chip 
                  label={result.type === 'revenue' ? 'Оборот' : 'ЗП'} 
                  size="small"
                  color={result.type === 'revenue' ? 'primary' : 'info'}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  )
}
