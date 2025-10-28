import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, TextField, Button, ToggleButtonGroup, ToggleButton, alpha, Autocomplete, Chip, Switch, FormControlLabel } from '@mui/material'
import { ArrowBack, Check, FastForward, ListAlt } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'
import { haptics } from '../utils/haptics'

export default function QuickAddEntry() {
  const navigate = useNavigate()
  const { entries, addEntry, syncData } = useAppStore()
  
  const [quickMode, setQuickMode] = useState(true)
  const [type, setType] = useState<'amount' | 'salary'>('amount')
  const [singleInput, setSingleInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  })
  const [addedCount, setAddedCount] = useState(0)
  const [todayTotal, setTodayTotal] = useState(0)
  
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Автофокус
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Автокомплит клиентов из истории (топ 10)
  const clientSuggestions = Array.from(
    new Set(
      Object.values(entries)
        .flat()
        .filter((e: any) => e.symbols && e.amount)
        .map((e: any) => e.symbols.trim())
    )
  ).slice(0, 10)

  // Парсинг: "5000 Иванов" или "Иванов 5000"
  const parseInput = (input: string): { amount: number; name: string } | null => {
    const trimmed = input.trim()
    if (!trimmed) return null

    // Попытка 1: "5000 Иванов"
    const match1 = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
    if (match1) {
      return { amount: parseFloat(match1[1]), name: match1[2].trim() }
    }

    // Попытка 2: "Иванов 5000"
    const match2 = trimmed.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/)
    if (match2) {
      return { amount: parseFloat(match2[2]), name: match2[1].trim() }
    }

    return null
  }

  const handleQuickAdd = async () => {
    let name: string
    let amount: number

    if (quickMode) {
      // Быстрый режим: парсим единое поле
      if (type === 'salary') {
        // Для зарплаты в быстром режиме: только сумма, имя = "ЗАРПЛАТА"
        const amountValue = parseFloat(singleInput.trim())
        if (isNaN(amountValue) || amountValue <= 0) {
          haptics.error()
          return
        }
        name = 'ЗАРПЛАТА'
        amount = amountValue
      } else {
        // Для оборота: парсим "сумма имя" или "имя сумма"
        const parsed = parseInput(singleInput)
        if (!parsed) {
          haptics.error()
          return
        }
        name = parsed.name
        amount = parsed.amount
      }
    } else {
      // Обычный режим: используем отдельные поля
      if (type === 'salary') {
        // Для зарплаты имя по умолчанию "ЗАРПЛАТА"
        name = 'ЗАРПЛАТА'
        amount = parseFloat(amountInput)
      } else {
        if (!nameInput.trim() || !amountInput) {
          haptics.error()
          return
        }
        name = nameInput.trim()
        amount = parseFloat(amountInput)
      }

      if (isNaN(amount) || amount <= 0) {
        haptics.error()
        return
      }
    }

    haptics.success()
    
    const [year, month, day] = date.split('-')
    const formattedDate = `${day}.${month}.${year}`

    const entry: any = {
      date: formattedDate,
      symbols: name
    }

    if (type === 'amount') {
      entry.amount = amount
    } else {
      entry.salary = amount
    }

    await addEntry(entry)
    setAddedCount(prev => prev + 1)
    setTodayTotal(prev => prev + amount)
    
    // Синхронизируем данные
    await syncData()
    
    if (quickMode) {
      // Быстрый режим: очищаем и возвращаем фокус
      setSingleInput('')
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Обычный режим: очищаем поля и остаемся на странице
      setNameInput('')
      setAmountInput('')
      navigate(`/day/${year}/${month}/${day}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && singleInput.trim()) {
      e.preventDefault()
      handleQuickAdd()
    } else if (e.key === 'Escape') {
      navigate(-1)
    }
  }


  return (
    <Box>
      {/* Хедер */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <IconButton 
          size="small"
          onClick={() => navigate(-1)}
          sx={{ bgcolor: alpha('#667eea', 0.08) }}
        >
          <ArrowBack fontSize="small" sx={{ color: '#667eea' }} />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            Быстрое добавление
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {addedCount > 0 ? `Добавлено: ${addedCount} • +$${todayTotal.toLocaleString()}` : 'Введи "сумма имя" или "имя сумма"'}
          </Typography>
        </Box>
        <IconButton
          onClick={() => navigate('/add/bulk')}
          sx={{ 
            bgcolor: alpha('#f093fb', 0.08),
            width: 48,
            height: 48
          }}
        >
          <ListAlt sx={{ color: '#f093fb', fontSize: 28 }} />
        </IconButton>
      </Stack>

      <Card sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Режим быстрого добавления */}
          <FormControlLabel
            control={
              <Switch 
                checked={quickMode} 
                onChange={(e) => setQuickMode(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#667eea',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#667eea',
                  },
                }}
              />
            }
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <FastForward fontSize="small" sx={{ color: quickMode ? '#667eea' : 'text.secondary' }} />
                <Typography variant="body2" fontSize="0.875rem" fontWeight={quickMode ? 600 : 400}>
                  Режим быстрого добавления
                </Typography>
              </Stack>
            }
          />

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

          {/* Поля ввода */}
          {quickMode ? (
            // Быстрый режим: единое поле
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
                {type === 'salary' ? 'Сумма зарплаты' : 'Запись (сумма + имя)'}
              </Typography>
              <Autocomplete
                freeSolo
                options={clientSuggestions.map(name => `${name}`)}
                inputValue={singleInput}
                onInputChange={(e, val) => setSingleInput(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={inputRef}
                    placeholder={type === 'salary' ? '5000' : '5000 Иванов или Иванов 5000'}
                    size="small"
                    onKeyDown={handleKeyDown}
                    type={type === 'salary' ? 'number' : 'text'}
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
                    <Typography fontSize="0.875rem">{option}</Typography>
                  </li>
                )}
              />
              
              {/* Подсказки */}
              {clientSuggestions.length > 0 && !singleInput && (
                <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary" fontSize="0.65rem" mr={0.5}>
                    Быстрый выбор:
                  </Typography>
                  {clientSuggestions.slice(0, 5).map(name => (
                    <Chip 
                      key={name}
                      label={name}
                      size="small"
                      onClick={() => setSingleInput(name + ' ')}
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

              {/* Превью парсинга */}
              {singleInput && (() => {
                if (type === 'salary') {
                  const amount = parseFloat(singleInput.trim())
                  if (!isNaN(amount) && amount > 0) {
                    return (
                      <Box 
                        mt={1} 
                        p={1.5} 
                        sx={{ 
                          bgcolor: alpha('#f093fb', 0.05),
                          borderRadius: 1.5,
                          border: `1px solid ${alpha('#f093fb', 0.2)}`
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                            Превью:
                          </Typography>
                          <Typography variant="body2" fontSize="0.875rem" fontWeight={600}>
                            ЗАРПЛАТА
                          </Typography>
                          <Typography variant="body2" fontSize="0.875rem" fontWeight={700} sx={{ color: '#f093fb' }}>
                            ${amount.toLocaleString()}
                          </Typography>
                        </Stack>
                      </Box>
                    )
                  }
                } else {
                  const parsed = parseInput(singleInput)
                  if (parsed) {
                    return (
                      <Box 
                        mt={1} 
                        p={1.5} 
                        sx={{ 
                          bgcolor: alpha('#667eea', 0.05),
                          borderRadius: 1.5,
                          border: `1px solid ${alpha('#667eea', 0.2)}`
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
                            Превью:
                          </Typography>
                          <Typography variant="body2" fontSize="0.875rem" fontWeight={600}>
                            {parsed.name}
                          </Typography>
                          <Typography variant="body2" fontSize="0.875rem" fontWeight={700} sx={{ color: '#667eea' }}>
                            ${parsed.amount.toLocaleString()}
                          </Typography>
                        </Stack>
                      </Box>
                    )
                  }
                }
                return null
              })()}
            </Box>
          ) : (
            // Обычный режим: раздельные поля
            <Stack spacing={2}>
              {type === 'amount' && (
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
                    Имя клиента
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={clientSuggestions}
                    inputValue={nameInput}
                    onInputChange={(e, val) => setNameInput(val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputRef={inputRef}
                        placeholder="Введите имя"
                        size="small"
                        sx={{
                          '& .MuiInputBase-root': {
                            borderRadius: 2,
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                    )}
                  />
                </Box>
              )}
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
                  {type === 'salary' ? 'Сумма зарплаты' : 'Сумма'}
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0"
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && amountInput && (type === 'salary' || nameInput.trim())) {
                      e.preventDefault()
                      handleQuickAdd()
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: 2,
                      fontSize: '0.875rem'
                    }
                  }}
                />
                {type === 'salary' && (
                  <Typography variant="caption" color="text.secondary" fontSize="0.65rem" mt={0.5} display="block">
                    Имя будет установлено как "ЗАРПЛАТА"
                  </Typography>
                )}
              </Box>
            </Stack>
          )}

          {/* Кнопки */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={
              quickMode 
                ? (type === 'salary' ? !singleInput.trim() : !parseInput(singleInput))
                : (type === 'amount' ? (!nameInput.trim() || !amountInput) : !amountInput)
            }
            onClick={handleQuickAdd}
            startIcon={<Check />}
            sx={{
              py: 1.25,
              borderRadius: 2,
              background: type === 'salary' 
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'none',
              '&:disabled': {
                background: alpha('#000', 0.12)
              }
            }}
          >
            {quickMode ? 'Добавить (Enter)' : 'Добавить'}
          </Button>

          {/* Подсказки */}
          <Box 
            p={1.5} 
            sx={{ 
              bgcolor: alpha('#f093fb', 0.05),
              borderRadius: 1.5,
              border: `1px dashed ${alpha('#f093fb', 0.3)}`
            }}
          >
            <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
              💡 <strong>Подсказка:</strong> Вводи "5000 Иванов" или "Иванов 5000" → Enter → автоматически очищается и готов к следующей записи
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  )
}
