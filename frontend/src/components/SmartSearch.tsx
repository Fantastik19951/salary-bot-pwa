import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, TextField, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Box, Typography, Chip, Stack, InputAdornment, alpha } from '@mui/material'
import { Search, Person, AttachMoney, CalendarToday, TrendingUp, Close } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'

interface SmartSearchProps {
  open: boolean
  onClose: () => void
}

export default function SmartSearch({ open, onClose }: SmartSearchProps) {
  const navigate = useNavigate()
  const { entries } = useAppStore()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) {
      setQuery('')
    }
  }, [open])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const lowerQuery = query.toLowerCase().trim()
    const results: any[] = []

    // Поиск по клиентам
    const clientMatches = new Map<string, { count: number; total: number; dates: string[] }>()
    
    Object.entries(entries).forEach(([periodKey, periodEntries]) => {
      periodEntries.forEach((entry: any) => {
        const clientName = entry.symbols?.toLowerCase() || ''
        const amount = entry.amount || entry.salary || 0
        
        if (clientName.includes(lowerQuery)) {
          if (!clientMatches.has(entry.symbols)) {
            clientMatches.set(entry.symbols, { count: 0, total: 0, dates: [] })
          }
          const match = clientMatches.get(entry.symbols)!
          match.count++
          match.total += amount
          match.dates.push(entry.date)
        }
      })
    })

    // Добавляем результаты по клиентам
    clientMatches.forEach((data, client) => {
      results.push({
        type: 'client',
        title: client,
        subtitle: `${data.count} записей • $${data.total.toLocaleString()}`,
        action: () => {
          onClose()
          navigate(`/clients`)
        }
      })
    })

    // Поиск по сумме (>5000, <10000, 5000-10000)
    const amountMatch = lowerQuery.match(/^([><]?)(\d+)(-(\d+))?$/)
    if (amountMatch) {
      const operator = amountMatch[1]
      const amount1 = parseInt(amountMatch[2])
      const amount2 = amountMatch[4] ? parseInt(amountMatch[4]) : null

      Object.entries(entries).forEach(([periodKey, periodEntries]) => {
        periodEntries.forEach((entry: any, idx: number) => {
          const amount = entry.amount || entry.salary || 0
          let matches = false

          if (operator === '>') {
            matches = amount > amount1
          } else if (operator === '<') {
            matches = amount < amount1
          } else if (amount2) {
            matches = amount >= amount1 && amount <= amount2
          } else {
            matches = amount === amount1
          }

          if (matches) {
            const [month, year] = periodKey.split('-')
            const [day, mon, yr] = entry.date.split('.')
            results.push({
              type: 'entry',
              title: `${entry.symbols} • $${amount.toLocaleString()}`,
              subtitle: entry.date,
              action: () => {
                onClose()
                navigate(`/day/${yr}/${mon}/${day}`)
              }
            })
          }
        })
      })
    }

    // Поиск по дате
    const dateMatch = lowerQuery.match(/(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?/)
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0')
      const month = dateMatch[2].padStart(2, '0')
      const year = dateMatch[3] ? (dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3]) : new Date().getFullYear().toString()
      
      const dateStr = `${day}.${month}.${year}`
      const periodKey = `${year}-${month}`
      const dayEntries = entries[periodKey]?.filter((e: any) => e.date === dateStr) || []
      
      if (dayEntries.length > 0) {
        const total = dayEntries.reduce((sum: number, e: any) => sum + (e.amount || e.salary || 0), 0)
        results.push({
          type: 'day',
          title: `${dateStr} (${dayEntries.length} записей)`,
          subtitle: `Всего: $${total.toLocaleString()}`,
          action: () => {
            onClose()
            navigate(`/day/${year}/${month}/${day}`)
          }
        })
      }
    }

    return results.slice(0, 10)
  }, [query, entries, navigate, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      searchResults[0].action()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          position: 'fixed',
          top: 100,
          m: 0
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box p={2} pb={1}>
          <TextField
            fullWidth
            autoFocus
            placeholder="Поиск по клиентам, суммам, датам..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <Close 
                    sx={{ color: 'text.secondary', cursor: 'pointer', fontSize: 20 }}
                    onClick={() => setQuery('')}
                  />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Box>

        {!query && (
          <Box p={2} pt={0}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Примеры поиска:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip label="Иванов" size="small" onClick={() => setQuery('Иванов')} />
              <Chip label=">5000" size="small" onClick={() => setQuery('>5000')} />
              <Chip label="15.01" size="small" onClick={() => setQuery('15.01')} />
              <Chip label="5000-10000" size="small" onClick={() => setQuery('5000-10000')} />
            </Stack>
          </Box>
        )}

        {query && searchResults.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Ничего не найдено
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Попробуй изменить запрос
            </Typography>
          </Box>
        )}

        {searchResults.length > 0 && (
          <List sx={{ pt: 0, pb: 1 }}>
            {searchResults.map((result, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemButton
                  onClick={result.action}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      bgcolor: alpha('#667eea', 0.08)
                    }
                  }}
                >
                  <ListItemIcon>
                    {result.type === 'client' && <Person sx={{ color: '#667eea' }} />}
                    {result.type === 'entry' && <AttachMoney sx={{ color: '#f093fb' }} />}
                    {result.type === 'day' && <CalendarToday sx={{ color: '#4facfe' }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.title}
                    secondary={result.subtitle}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        <Box p={2} pt={0} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Enter — открыть • Esc — закрыть
          </Typography>
          {searchResults.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {searchResults.length} результатов
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
