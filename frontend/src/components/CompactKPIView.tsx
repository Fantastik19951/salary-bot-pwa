import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, LinearProgress, alpha, Chip, Divider } from '@mui/material'
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

export default function CompactKPIView() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { entries } = useAppStore()

  const kpiData = useMemo(() => {
    const now = new Date()
    const currentPeriod = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevPeriod = `${prevMonth.getFullYear()}-${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}`

    const currentEntries = entries[currentPeriod] || []
    const prevEntries = entries[prevPeriod] || []

    const currentRevenue = currentEntries
      .filter((e: any) => e.amount)
      .reduce((sum: number, e: any) => sum + e.amount, 0)
    
    const prevRevenue = prevEntries
      .filter((e: any) => e.amount)
      .reduce((sum: number, e: any) => sum + e.amount, 0)

    const currentCount = currentEntries.filter((e: any) => e.amount).length
    const prevCount = prevEntries.filter((e: any) => e.amount).length

    const revenueDiff = currentRevenue - prevRevenue
    const revenueDiffPercent = prevRevenue > 0 ? (revenueDiff / prevRevenue) * 100 : 0

    const countDiff = currentCount - prevCount
    const countDiffPercent = prevCount > 0 ? (countDiff / prevCount) * 100 : 0

    const currentEarnings = currentRevenue * 0.1
    const prevEarnings = prevRevenue * 0.1
    const earningsDiff = currentEarnings - prevEarnings

    const avgTransaction = currentCount > 0 ? currentRevenue / currentCount : 0
    const prevAvgTransaction = prevCount > 0 ? prevRevenue / prevCount : 0
    const avgDiff = avgTransaction - prevAvgTransaction

    // Прогноз до конца месяца
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const daysLeft = daysInMonth - currentDay
    const avgPerDay = currentDay > 0 ? currentRevenue / currentDay : 0
    const forecast = currentRevenue + (avgPerDay * daysLeft)

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
      progress: (currentDay / daysInMonth) * 100
    }
  }, [entries])

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
          <Typography variant="h5" fontWeight={700}>
            KPI & Прогнозы
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Текущий месяц
          </Typography>
        </Box>
      </Stack>

      {/* Прогресс месяца */}
      <Card sx={{ mb: 2.5, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight={600}>
            Прогресс месяца
          </Typography>
          <Typography variant="caption" fontWeight={600} color="primary">
            {kpiData.progress.toFixed(0)}%
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={kpiData.progress} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            bgcolor: alpha('#667eea', 0.1),
            '& .MuiLinearProgress-bar': {
              background: GRADIENTS[0],
              borderRadius: 3
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" mt={0.5}>
          На основе текущих показателей
        </Typography>
      </Card>

      {/* Основные метрики */}
      <Stack spacing={1.5} mb={2.5}>
        {/* Оборот */}
        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box 
              sx={{ 
                width: 44,
                height: 44,
                borderRadius: 2,
                background: GRADIENTS[0],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize="1.25rem">💰</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                Оборот
              </Typography>
              <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
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
                  fontSize="0.7rem"
                >
                  {kpiData.revenueDiffPercent > 0 ? '+' : ''}{kpiData.revenueDiffPercent.toFixed(1)}%
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                vs пред. месяц
              </Typography>
            </Stack>
          </Stack>
        </Card>

        {/* Заработок */}
        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box 
              sx={{ 
                width: 44,
                height: 44,
                borderRadius: 2,
                background: GRADIENTS[1],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize="1.25rem">💵</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                Заработок (10%)
              </Typography>
              <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                {formatMoney(kpiData.currentEarnings)} $
              </Typography>
            </Box>
            
            <Stack alignItems="flex-end" spacing={0.5}>
              <Typography 
                variant="caption" 
                fontWeight={600} 
                color={getTrendColor(kpiData.earningsDiff)}
                fontSize="0.7rem"
              >
                {kpiData.earningsDiff > 0 ? '+' : ''}{formatMoney(kpiData.earningsDiff)} $
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                разница
              </Typography>
            </Stack>
          </Stack>
        </Card>

        {/* Транзакции */}
        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box 
              sx={{ 
                width: 44,
                height: 44,
                borderRadius: 2,
                background: GRADIENTS[2],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize="1.25rem">📊</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                Транзакций
              </Typography>
              <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
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
                  fontSize="0.7rem"
                >
                  {kpiData.countDiff > 0 ? '+' : ''}{kpiData.countDiff}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                vs пред. месяц
              </Typography>
            </Stack>
          </Stack>
        </Card>

        {/* Средний чек */}
        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box 
              sx={{ 
                width: 44,
                height: 44,
                borderRadius: 2,
                background: GRADIENTS[3],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize="1.25rem">📈</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                Средний чек
              </Typography>
              <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                {formatMoney(kpiData.avgTransaction)} $
              </Typography>
            </Box>
            
            <Stack alignItems="flex-end" spacing={0.5}>
              <Typography 
                variant="caption" 
                fontWeight={600} 
                color={getTrendColor(kpiData.avgDiff)}
                fontSize="0.7rem"
              >
                {kpiData.avgDiff > 0 ? '+' : ''}{formatMoney(kpiData.avgDiff)} $
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                разница
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      {/* Прогноз */}
      <Card sx={{ p: 2.5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
          Прогноз на конец месяца
        </Typography>
        <Typography variant="h5" fontWeight={800} mt={0.5}>
          {formatMoney(kpiData.forecast)} $
        </Typography>
        <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.65rem' }}>
              Оборот
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatMoney(kpiData.forecast)} $
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.65rem' }}>
              Заработок
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatMoney(kpiData.forecast * 0.1)} $
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  )
}
