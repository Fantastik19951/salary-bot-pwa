import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, TextField, Button, ToggleButtonGroup, ToggleButton, alpha, Autocomplete, Chip } from '@mui/material'
import { ArrowBack, AttachMoney, Person, Check } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'
import { haptics } from '../utils/haptics'

export default function CompactAddEntry() {
  const navigate = useNavigate()
  const { entries, addEntry, syncData } = useAppStore()
  
  const [type, setType] = useState<'amount' | 'salary'>('amount')
  const [client, setClient] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  })
  
  // Refs для фокуса
  const clientInputRef = useRef<HTMLInputElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  
  // Автофокус на первое поле
  useEffect(() => {
    setTimeout(() => clientInputRef.current?.focus(), 100)
  }, [])

  // Автокомплит клиентов из истории
  const clientSuggestions = Array.from(
    new Set(
      Object.values(entries)
        .flat()
        .filter((e: any) => e.symbols && e.amount)
        .map((e: any) => e.symbols.trim())
    )
  ).sort()

  const handleSubmit = async () => {
    if (!client || !amount) return

    haptics.success()
    
    const [year, month, day] = date.split('-')
    const formattedDate = `${day}.${month}.${year}`

    const entry: any = {
      date: formattedDate,
      symbols: client
    }

    if (type === 'amount') {
      entry.amount = parseFloat(amount)
    } else {
      entry.salary = parseFloat(amount)
    }

    await addEntry(entry)
    // Обновляем данные и переходим на день
    await syncData()
    navigate(`/day/${year}/${month}/${day}`)
  }
  
  // Обработка Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && client && amount) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Box>
      {/* Компактный хедер */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <IconButton 
          size="small"
          onClick={() => navigate(-1)}
          sx={{ bgcolor: alpha('#667eea', 0.08) }}
        >
          <ArrowBack fontSize="small" sx={{ color: '#667eea' }} />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Новая запись
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Добавить транзакцию
          </Typography>
        </Box>
      </Stack>

      <Card sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Тип */}
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
              Тип операции
            </Typography>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(e, val) => val && setType(val)}
              fullWidth
              size="small"
            >
              <ToggleButton 
                value="amount"
                sx={{
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: type === 'amount' ? 700 : 500,
                  background: type === 'amount' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: type === 'amount' ? 'white !important' : 'text.secondary',
                  border: `1px solid ${type === 'amount' ? 'transparent' : alpha('#000', 0.12)} !important`,
                  '&:hover': {
                    background: type === 'amount' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : alpha('#667eea', 0.05)
                  }
                }}
              >
                💰 Оборот
              </ToggleButton>
              <ToggleButton 
                value="salary"
                sx={{
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: type === 'salary' ? 700 : 500,
                  background: type === 'salary' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
                  color: type === 'salary' ? 'white !important' : 'text.secondary',
                  border: `1px solid ${type === 'salary' ? 'transparent' : alpha('#000', 0.12)} !important`,
                  '&:hover': {
                    background: type === 'salary'
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : alpha('#f093fb', 0.05)
                  }
                }}
              >
                💵 Зарплата
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Дата */}
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
              Дата
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>

          {/* Клиент */}
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
              {type === 'amount' ? 'Клиент' : 'Описание'}
            </Typography>
            <Autocomplete
              freeSolo
              options={clientSuggestions}
              value={client}
              onChange={(e, val) => setClient(val || '')}
              onInputChange={(e, val) => setClient(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={clientInputRef}
                  placeholder={type === 'amount' ? 'Введите имя клиента...' : 'Введите описание...'}
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      // Tab переходит на поле суммы
                      setTimeout(() => amountInputRef.current?.focus(), 0)
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: 2,
                      fontSize: '0.875rem'
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography fontSize="0.875rem">{option}</Typography>
                  </Stack>
                </li>
              )}
            />
            {clientSuggestions.length > 0 && !client && (
              <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem" mr={0.5}>
                  Быстрый выбор:
                </Typography>
                {clientSuggestions.slice(0, 3).map(name => (
                  <Chip 
                    key={name}
                    label={name}
                    size="small"
                    onClick={() => setClient(name)}
                    sx={{ 
                      height: 20, 
                      fontSize: '0.65rem',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha('#667eea', 0.1)
                      }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Сумма */}
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
              Сумма ($)
            </Typography>
            <TextField
              fullWidth
              type="tel"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                // Разрешаем только цифры и точку
                const value = e.target.value.replace(/[^\d.]/g, '')
                setAmount(value)
              }}
              onKeyDown={handleKeyDown}
              inputRef={amountInputRef}
              size="small"
              inputMode="decimal"
              inputProps={{
                pattern: '[0-9]*\\.?[0-9]*',
                inputMode: 'decimal'
              }}
              InputProps={{
                startAdornment: <AttachMoney fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
              }}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>

          {/* Кнопка */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!client || !amount}
            onClick={handleSubmit}
            startIcon={<Check />}
            sx={{
              mt: 1,
              py: 1.25,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'none',
              '&:disabled': {
                background: alpha('#000', 0.12)
              }
            }}
          >
            Добавить запись
          </Button>
        </Stack>
      </Card>
    </Box>
  )
}
