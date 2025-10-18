import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography, IconButton, Stack, TextField, Button, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { ArrowBack, Home, Save } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'
import { format } from 'date-fns'

export default function AddEntry() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addEntry } = useAppStore()
  
  const [entryType, setEntryType] = useState<'amount' | 'salary'>('amount')
  const [date, setDate] = useState('')
  const [symbols, setSymbols] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      setDate(dateParam)
    } else {
      const today = new Date()
      setDate(format(today, 'dd.MM.yyyy'))
    }
  }, [searchParams])

  const handleSubmit = async () => {
    if (!date || !amount) {
      alert('Заполните все поля')
      return
    }

    const entry: any = {
      date,
      symbols: entryType === 'salary' ? '💰 Зарплата' : symbols
    }

    if (entryType === 'salary') {
      entry.salary = parseFloat(amount.replace(',', '.'))
    } else {
      if (!symbols) {
        alert('Укажите название')
        return
      }
      entry.amount = parseFloat(amount.replace(',', '.'))
    }

    await addEntry(entry)
    
    const [day, month, year] = date.split('.')
    navigate(`/day/${year}/${parseInt(month)}/${parseInt(day)}`)
  }

  const handleUseToday = () => {
    const today = new Date()
    setDate(format(today, 'dd.MM.yyyy'))
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700 }}>
          ➕ ДОБАВИТЬ ЗАПИСЬ
        </Typography>
        <IconButton onClick={() => navigate('/')} color="primary">
          <Home />
        </IconButton>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" justifyContent="center">
              <ToggleButtonGroup
                value={entryType}
                exclusive
                onChange={(_, value) => value && setEntryType(value)}
                fullWidth
              >
                <ToggleButton value="amount">Оборот</ToggleButton>
                <ToggleButton value="salary">Зарплата</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Дата (ДД.ММ.ГГГГ):
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="01.01.2025"
                />
                <Button 
                  variant="outlined" 
                  onClick={handleUseToday}
                  sx={{ minWidth: 100 }}
                >
                  Сегодня
                </Button>
              </Stack>
            </Box>

            {entryType === 'amount' && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Название:
                </Typography>
                <TextField
                  fullWidth
                  value={symbols}
                  onChange={(e) => setSymbols(e.target.value)}
                  placeholder="Введите название"
                />
              </Box>
            )}

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Сумма ($):
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                inputProps={{ step: '0.01' }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSubmit}
            >
              Сохранить
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
