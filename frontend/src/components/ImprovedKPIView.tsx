import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, LinearProgress, alpha, ButtonGroup, Button, Divider } from '@mui/material'
import { ArrowBack, TrendingUp, TrendingDown, Remove } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(Math.floor(amount))

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
]

export default function ImprovedKPIView() {
  const navigate = useNavigate()
  const { entries } = useAppStore()
  const [mode, setMode] = useState<'month' | 'period'>('month') // месяц или период
  
  // Автоопределение текущего периода
  const currentDay = new Date().getDate()
  const autoPeriodType: 'first' | 'second' = currentDay <= 15 ? 'first' : 'second'

  const kpiData = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    // Определяем текущий и предыдущий периоды
    let currentPeriodKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
    let prevPeriodKey = ''
    
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
    prevPeriodKey = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`

    const currentEntries = entries[currentPeriodKey] || []
    const prevEntries = entries[prevPeriodKey] || []

    // Фильтруем по периоду если нужно
    const filterByPeriod = (arr: any[], type: 'first' | 'second', upToCurrentDay: boolean = false) => {
      return arr.filter((e: any) => {
        const day = parseInt(e.date.split('.')[0])
        if (type === 'first') {
          // Первый период: 1-15
          return upToCurrentDay ? (day >= 1 && day <= Math.min(currentDay, 15)) : (day >= 1 && day <= 15)
        } else {
          // Второй период: 16-31
          if (upToCurrentDay) {
            return day >= 16 && day <= currentDay
          } else {
            return day >= 16 && day <= 31
          }
        }
      })
    }

    const currentFiltered = mode === 'period' 
      ? filterByPeriod(currentEntries, autoPeriodType, true)
      : currentEntries.filter((e: any) => {
          const day = parseInt(e.date.split('.')[0])
          return day <= currentDay
        })

    const prevFiltered = mode === 'period'
      ? filterByPeriod(prevEntries, autoPeriodType, false)
      : prevEntries

    const currentRevenue = currentFiltered
      .filter((e: any) => e.amount)
      .reduce((sum: number, e: any) => sum + e.amount, 0)
    
    const prevRevenue = prevFiltered
      .filter((e: any) => e.amount)
      .reduce((sum: number, e: any) => sum + e.amount, 0)

    // Подсчет зарплат
    const currentSalaries = currentFiltered
      .filter((e: any) => e.salary)
      .reduce((sum: number, e: any) => sum + e.salary, 0)
    
    const prevSalaries = prevFiltered
      .filter((e: any) => e.salary)
      .reduce((sum: number, e: any) => sum + e.salary, 0)

    const currentCount = currentFiltered.filter((e: any) => e.amount).length
    const prevCount = prevFiltered.filter((e: any) => e.amount).length

    const revenueDiff = currentRevenue - prevRevenue
    const revenueDiffPercent = prevRevenue > 0 ? (revenueDiff / prevRevenue) * 100 : 0

    const countDiff = currentCount - prevCount
    const countDiffPercent = prevCount > 0 ? (countDiff / prevCount) * 100 : 0

    // Прибыль = только 10% от выручки
    const currentEarnings = currentRevenue * 0.1
    const prevEarnings = prevRevenue * 0.1
    const earningsDiff = currentEarnings - prevEarnings

    const avgTransaction = currentCount > 0 ? currentRevenue / currentCount : 0
    const prevAvgTransaction = prevCount > 0 ? prevRevenue / prevCount : 0
    const avgDiff = avgTransaction - prevAvgTransaction

    // Прогноз
    let forecast = 0
    let progress = 0
    
    if (mode === 'month') {
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
      const daysLeft = daysInMonth - currentDay
      const avgPerDay = currentDay > 0 ? currentRevenue / currentDay : 0
      forecast = currentRevenue + (avgPerDay * daysLeft)
      progress = (currentDay / daysInMonth) * 100
    } else {
      const totalDays = 15
      const currentPeriodDay = autoPeriodType === 'first' 
        ? Math.min(currentDay, 15) 
        : Math.max(0, currentDay - 15)
      const daysLeft = totalDays - currentPeriodDay
      const avgPerDay = currentPeriodDay > 0 ? currentRevenue / currentPeriodDay : 0
      forecast = currentRevenue + (avgPerDay * daysLeft)
      progress = (currentPeriodDay / totalDays) * 100
    }

    return {
      currentRevenue,
      prevRevenue,
      revenueDiff,
      revenueDiffPercent,
      currentCount,
      prevCount,
      countDiff,
      countDiffPercent,
      currentEarnings,
      earningsDiff,
      avgTransaction,
      avgDiff,
      forecast,
      progress,
      periodType: autoPeriodType,
      currentSalaries,
      prevSalaries
    }
  }, [entries, mode, autoPeriodType])

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />
    if (value < 0) return <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />
    return <Remove fontSize="small" sx={{ color: 'text.secondary' }} />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'success.main'
    if (value < 0) return 'error.main'
    return 'text.secondary'
  }

  return (
    <Box>
      {/* Компактный хедер */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
        <IconButton 
          size="small"
          onClick={() => navigate(-1)}
          sx={{ bgcolor: alpha('#667eea', 0.08) }}
        >
          <ArrowBack fontSize="small" sx={{ color: '#667eea' }} />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            KPI & Прогнозы
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            {mode === 'month' ? 'Месяц к месяцу' : `Период ${kpiData.periodType === 'first' ? '1-15' : '16-31'} (авто)`}
          </Typography>
        </Box>
      </Stack>

      {/* Фильтры */}
      <ButtonGroup size="small" fullWidth sx={{ height: { xs: 32, sm: 36 }, mb: 2.5 }}>
        <Button
          onClick={() => setMode('month')}
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: mode === 'month' ? 700 : 500,
            background: mode === 'month' ? GRADIENTS[0] : 'white',
            color: mode === 'month' ? 'white' : 'text.secondary',
            border: `1px solid ${mode === 'month' ? 'transparent' : alpha('#000', 0.12)} !important`,
            '&:hover': {
              background: mode === 'month' ? GRADIENTS[0] : alpha('#667eea', 0.05)
            }
          }}
        >
          Месяц к месяцу
        </Button>
        <Button
          onClick={() => setMode('period')}
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: mode === 'period' ? 700 : 500,
            background: mode === 'period' ? GRADIENTS[1] : 'white',
            color: mode === 'period' ? 'white' : 'text.secondary',
            border: `1px solid ${mode === 'period' ? 'transparent' : alpha('#000', 0.12)} !important`,
            '&:hover': {
              background: mode === 'period' ? GRADIENTS[1] : alpha('#f093fb', 0.05)
            }
          }}
        >
          Период к периоду
        </Button>
      </ButtonGroup>

      {/* Прогресс */}
      <Card sx={{ mb: 2.5, p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Прогресс {mode === 'month' ? 'месяца' : 'периода'}
          </Typography>
          <Typography variant="caption" fontWeight={600} color="primary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            {kpiData.progress.toFixed(0)}%
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={kpiData.progress} 
          sx={{ 
            height: { xs: 4, sm: 6 }, 
            borderRadius: 3,
            bgcolor: alpha('#667eea', 0.1),
            '& .MuiLinearProgress-bar': {
              background: GRADIENTS[0],
              borderRadius: 3
            }
          }} 
        />
      </Card>

      {/* Метрики */}
      <Stack spacing={1.5} mb={2.5}>
        <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
            <Box 
              sx={{ 
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                borderRadius: 2,
                background: GRADIENTS[0],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize={{ xs: '1rem', sm: '1.25rem' }}>💰</Typography>
            </Box>
            
            <Box flex={1} minWidth={0}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                Оборот
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }} noWrap>
                {formatMoney(kpiData.currentRevenue)} $
              </Typography>
            </Box>
            
            <Stack alignItems="flex-end" spacing={0.5}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {getTrendIcon(kpiData.revenueDiff)}
                <Typography 
                  variant="caption" 
                  fontWeight={600} 
                  color={getTrendColor(kpiData.revenueDiff)}
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                >
                  {kpiData.revenueDiffPercent > 0 ? '+' : ''}{kpiData.revenueDiffPercent.toFixed(1)}%
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                vs предыдущий
              </Typography>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
            <Box 
              sx={{ 
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                borderRadius: 2,
                background: GRADIENTS[1],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize={{ xs: '1rem', sm: '1.25rem' }}>💵</Typography>
            </Box>
            
            <Box flex={1} minWidth={0}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                Прибыль (10%)
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }} noWrap>
                {formatMoney(kpiData.currentEarnings)} $
              </Typography>
            </Box>
            
            <Stack alignItems="flex-end" spacing={0.5}>
              <Typography 
                variant="caption" 
                fontWeight={600} 
                color={getTrendColor(kpiData.earningsDiff)}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              >
                {kpiData.earningsDiff > 0 ? '+' : ''}{formatMoney(kpiData.earningsDiff)} $
              </Typography>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
            <Box 
              sx={{ 
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                borderRadius: 2,
                background: GRADIENTS[2],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize={{ xs: '1rem', sm: '1.25rem' }}>📊</Typography>
            </Box>
            
            <Box flex={1} minWidth={0}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                Транзакций
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                {kpiData.currentCount}
              </Typography>
            </Box>
            
            <Stack alignItems="flex-end" spacing={0.5}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {getTrendIcon(kpiData.countDiff)}
                <Typography 
                  variant="caption" 
                  fontWeight={600} 
                  color={getTrendColor(kpiData.countDiff)}
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                >
                  {kpiData.countDiff > 0 ? '+' : ''}{kpiData.countDiff}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      {/* Прогноз */}
      <Card sx={{ p: { xs: 2, sm: 2.5 }, background: GRADIENTS[0], color: 'white' }}>
        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
          Прогноз на конец {mode === 'month' ? 'месяца' : 'периода'}
        </Typography>
        <Typography variant="h5" fontWeight={800} mt={0.5} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {formatMoney(kpiData.forecast)} $
        </Typography>
        <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.75, fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
              Оборот
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {formatMoney(kpiData.forecast)} $
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" sx={{ opacity: 0.75, fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
              Прибыль
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {formatMoney(kpiData.forecast * 0.1)} $
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  )
}
