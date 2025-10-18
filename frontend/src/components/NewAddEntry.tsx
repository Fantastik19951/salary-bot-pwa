import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Card, Typography, TextField, Button, Stack, ToggleButtonGroup, ToggleButton, Avatar, IconButton, alpha, Autocomplete } from '@mui/material'
import { ArrowBack, Save, AttachMoney, CalendarMonth, Person, Notes } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { format } from 'date-fns'

export default function NewAddEntry() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addEntry, entries } = useAppStore()
  
  const [type, setType] = useState<'amount' | 'salary'>('amount')
  const [date, setDate] = useState(searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'))
  const [client, setClient] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  // Получаем список всех клиентов для автодополнения
  const allClients = Array.from(
    new Set(
      Object.values(entries)
        .flat()
        .filter((e: any) => e.amount && e.symbols)
        .map((e: any) => e.symbols)
    )
  ).sort()

  const handleSubmit = async () => {
    if (!client || !amount) return

    const [year, month, day] = date.split('-')
    const entry: any = {
      date: `${day}.${month}.${year}`,
      symbols: client
    }

    if (type === 'salary') {
      entry.salary = parseFloat(amount)
    } else {
      entry.amount = parseFloat(amount)
    }

    await addEntry(entry)
    navigate(-1)
  }

  return (
    <Box>
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
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Новая запись
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Добавьте информацию о транзакции
          </Typography>
        </Box>
      </Stack>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '1px solid',
            borderColor: alpha('#667eea', 0.1)
          }}
        >
          <Stack spacing={4}>
            {/* Type */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#667eea', 0.1) }}>
                  <AttachMoney sx={{ fontSize: 20, color: '#667eea' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>
                  Тип записи
                </Typography>
              </Stack>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(e, val) => val && setType(val)}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    py: 2,
                    border: '2px solid',
                    borderColor: alpha('#667eea', 0.2),
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: '2px solid transparent',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="amount">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700}>💰</Typography>
                    <Typography fontWeight={600}>Оборот</Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="salary">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700}>💵</Typography>
                    <Typography fontWeight={600}>Зарплата</Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Date */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#4facfe', 0.1) }}>
                  <CalendarMonth sx={{ fontSize: 20, color: '#4facfe' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>
                  Дата
                </Typography>
              </Stack>
              <TextField
                fullWidth
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputProps={{
                  sx: {
                    borderRadius: 3,
                    '& fieldset': {
                      borderWidth: 2,
                      borderColor: alpha('#4facfe', 0.2)
                    },
                    '&:hover fieldset': {
                      borderColor: alpha('#4facfe', 0.4)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4facfe'
                    }
                  }
                }}
              />
            </Box>

            {/* Client */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#f093fb', 0.1) }}>
                  <Person sx={{ fontSize: 20, color: '#f093fb' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>
                  {type === 'amount' ? 'Клиент' : 'Описание'}
                </Typography>
              </Stack>
              <Autocomplete
                freeSolo
                options={allClients}
                value={client}
                onInputChange={(e, val) => setClient(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={type === 'amount' ? 'Например: Иван Петров' : 'Зарплата за период'}
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        borderRadius: 3,
                        '& fieldset': {
                          borderWidth: 2,
                          borderColor: alpha('#f093fb', 0.2)
                        },
                        '&:hover fieldset': {
                          borderColor: alpha('#f093fb', 0.4)
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#f093fb'
                        }
                      }
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {type === 'amount' ? 'Начните вводить имя или выберите из списка' : 'Добавьте описание выплаты'}
              </Typography>
            </Box>

            {/* Amount */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#fa709a', 0.1) }}>
                  <AttachMoney sx={{ fontSize: 20, color: '#fa709a' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>
                  Сумма
                </Typography>
              </Stack>
              <TextField
                fullWidth
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                InputProps={{
                  endAdornment: <Typography fontWeight={700} color="text.secondary">$</Typography>,
                  sx: {
                    borderRadius: 3,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    '& fieldset': {
                      borderWidth: 2,
                      borderColor: alpha('#fa709a', 0.2)
                    },
                    '&:hover fieldset': {
                      borderColor: alpha('#fa709a', 0.4)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a'
                    }
                  }
                }}
              />
            </Box>

            {/* Buttons */}
            <Stack direction="row" spacing={2} pt={2}>
              <Button
                fullWidth
                size="large"
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: 3,
                  py: 2,
                  color: 'text.secondary',
                  borderColor: alpha('#000', 0.1),
                  '&:hover': {
                    borderColor: alpha('#000', 0.2),
                    bgcolor: alpha('#000', 0.02)
                  }
                }}
              >
                Отмена
              </Button>
              <Button
                fullWidth
                size="large"
                variant="contained"
                disabled={!client || !amount}
                onClick={handleSubmit}
                startIcon={<Save />}
                sx={{
                  borderRadius: 3,
                  py: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35)',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.45)',
                  },
                  '&:disabled': {
                    background: alpha('#000', 0.1),
                    boxShadow: 'none'
                  }
                }}
              >
                Сохранить
              </Button>
            </Stack>
          </Stack>
        </Card>
      </motion.div>
    </Box>
  )
}
