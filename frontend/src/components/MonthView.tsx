import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Button, Stack, IconButton, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { ArrowBack, Home } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const formatAmount = (x: number): string => {
  if (Math.abs(x - Math.floor(x)) < 1e-9) {
    return Math.floor(x).toLocaleString('ru-RU')
  }
  return x.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function MonthView() {
  const { year, month } = useParams()
  const navigate = useNavigate()
  const { entries } = useAppStore()
  
  const [half, setHalf] = useState<'first' | 'second'>(() => {
    const today = new Date()
    if (today.getFullYear() === parseInt(year!) && today.getMonth() + 1 === parseInt(month!)) {
      return today.getDate() <= 15 ? 'first' : 'second'
    }
    return 'second'
  })

  const periodKey = `${year}-${month!.padStart(2, '0')}`
  const monthEntries = entries[periodKey] || []

  const { days, total } = useMemo(() => {
    const filtered = monthEntries.filter(e => {
      if (!e.amount) return false
      const day = parseInt(e.date.split('.')[0])
      return half === 'first' ? day <= 15 : day > 15
    })

    const daysMap = new Map<string, number>()
    filtered.forEach(e => {
      const current = daysMap.get(e.date) || 0
      daysMap.set(e.date, current + (e.amount || 0))
    })

    const days = Array.from(daysMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => {
        const [dayA] = a.date.split('.').map(Number)
        const [dayB] = b.date.split('.').map(Number)
        return dayA - dayB
      })

    const total = days.reduce((sum, d) => sum + d.amount, 0)

    return { days, total }
  }, [monthEntries, half])

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700 }}>
          {MONTH_NAMES[parseInt(month!) - 1]} {year}
        </Typography>
        <IconButton onClick={() => navigate('/')} color="primary">
          <Home />
        </IconButton>
      </Box>

      <Box display="flex" justifyContent="center">
        <ToggleButtonGroup
          value={half}
          exclusive
          onChange={(_, value) => value && setHalf(value)}
          size="small"
        >
          <ToggleButton value="first">1-15</ToggleButton>
          <ToggleButton value="second">16-31</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Card>
        <CardContent>
          {days.length === 0 ? (
            <Typography align="center" color="text.secondary">
              📭 Нет записей
            </Typography>
          ) : (
            <Stack spacing={1}>
              {days.map(({ date, amount }) => (
                <Button
                  key={date}
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    const [day, m, y] = date.split('.')
                    navigate(`/day/${y}/${parseInt(m)}/${parseInt(day)}`)
                  }}
                  sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                >
                  <span>🗓️ {date}</span>
                  <span style={{ fontWeight: 600 }}>{formatAmount(amount)} $</span>
                </Button>
              ))}
              
              <Divider sx={{ my: 1 }} />
              
              <Box display="flex" justifyContent="space-between" px={2}>
                <Typography variant="body1" fontWeight={700}>
                  ✅ Итого:
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  {formatAmount(total)} $
                </Typography>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
