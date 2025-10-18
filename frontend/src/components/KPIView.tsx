import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography, IconButton, Stack, LinearProgress } from '@mui/material'
import { ArrowBack, Home } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'
import { getDaysInMonth } from 'date-fns'

const formatAmount = (x: number): string => {
  if (Math.abs(x - Math.floor(x)) < 1e-9) {
    return Math.floor(x).toLocaleString('ru-RU')
  }
  return x.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function KPIView() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { entries } = useAppStore()

  const kpiData = useMemo(() => {
    const today = new Date()
    let start: Date, end: Date, periodEnd: Date
    
    if (type === 'current') {
      const day = today.getDate()
      if (day <= 15) {
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = today
        periodEnd = new Date(today.getFullYear(), today.getMonth(), 15)
      } else {
        start = new Date(today.getFullYear(), today.getMonth(), 16)
        end = today
        const lastDay = getDaysInMonth(today)
        periodEnd = new Date(today.getFullYear(), today.getMonth(), lastDay)
      }
    } else {
      const day = today.getDate()
      if (day <= 15) {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastDay = getDaysInMonth(lastMonth)
        start = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 16)
        end = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), lastDay)
        periodEnd = end
      } else {
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth(), 15)
        periodEnd = end
      }
    }

    const periodKey = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`
    const periodEntries = entries[periodKey] || []

    const filtered = periodEntries.filter(e => {
      if (!e.amount) return false
      const [day, month, year] = e.date.split('.').map(Number)
      const entryDate = new Date(year, month - 1, day)
      return entryDate >= start && entryDate <= end
    })

    const turnover = filtered.reduce((sum, e) => sum + (e.amount || 0), 0)
    const salary = turnover * 0.10
    const filledDays = new Set(filtered.map(e => e.date)).size
    const totalDays = Math.floor((periodEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const avgPerDay = filledDays > 0 ? salary / filledDays : 0
    const forecast = type === 'current' ? avgPerDay * totalDays : null
    const progress = (filledDays / totalDays) * 100

    return {
      title: type === 'current' ? '📊 KPI текущего' : '📊 KPI прошлого',
      start: start.toLocaleDateString('ru-RU'),
      end: periodEnd.toLocaleDateString('ru-RU'),
      turnover,
      salary,
      filledDays,
      totalDays,
      avgPerDay,
      forecast,
      progress
    }
  }, [entries, type])

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700 }}>
          {kpiData.title}
        </Typography>
        <IconButton onClick={() => navigate('/')} color="primary">
          <Home />
        </IconButton>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {kpiData.start} – {kpiData.end}
          </Typography>

          <Stack spacing={2} mt={2}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">💵 Оборот:</Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatAmount(kpiData.turnover)} $
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">💰 Зарплата (10%):</Typography>
              <Typography variant="body1" fontWeight={600} color="primary">
                {formatAmount(kpiData.salary)} $
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">📆 Заполнено дней:</Typography>
              <Typography variant="body1" fontWeight={600}>
                {kpiData.filledDays}/{kpiData.totalDays}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">📈 Среднее/день:</Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatAmount(kpiData.avgPerDay)} $
              </Typography>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Прогресс:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpiData.progress.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={kpiData.progress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {kpiData.forecast !== null && (
              <>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, borderRadius: 2, mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Прогноз на конец периода:
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatAmount(kpiData.forecast)} $
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
