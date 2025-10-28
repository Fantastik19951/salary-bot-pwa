import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Card, CardContent, Stack, Chip, Avatar, LinearProgress, alpha } from '@mui/material'
import { TrendingUp, TrendingDown, ArrowForward, CalendarMonth, People, AttachMoney, Assessment, Star, Bolt, Timer, Logout } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { useAppStore } from '../store/appStore'
import { format, getDaysInMonth, startOfMonth, subMonths, differenceInDays, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { haptics } from '../utils/haptics'
import { normalizeClientName } from '../utils/normalize'
import { API_URL } from '../utils/env'

const MotionCard = motion(Card)

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

interface QuickAction {
  title: string
  icon: any
  color: string
  path: string
  description: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const { entries, syncData } = useAppStore()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [clientsCount, setClientsCount] = useState(0)

  useEffect(() => {
    fetch(`${API_URL}/api/clients/analytics`)
      .then(res => res.json())
      .then(data => setClientsCount(data.stats.totalClients))
      .catch(() => setClientsCount(0))
  }, [])
  
  const handleRefresh = async () => {
    haptics.medium()
    await syncData()
  }

  const forecast = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const currentDay = now.getDate()
    
    // Определяем текущий период
    const isFirstHalf = currentDay <= 15
    const periodDays = 15
    const currentPeriodDay = isFirstHalf ? currentDay : currentDay - 15

    const periodKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
    const currentEntries = entries[periodKey] || []
    
    // Фильтруем записи по текущему периоду
    const currentRevenue = currentEntries
      .filter((e: any) => {
        const day = parseInt(e.date.split('.')[0])
        if (isFirstHalf) {
          return e.amount && day >= 1 && day <= Math.min(currentDay, 15) && day <= 15
        } else {
          return e.amount && day >= 16 && day <= currentDay
        }
      })
      .reduce((sum: any, e: any) => sum + e.amount, 0)
    
    // Считаем зарплаты за период
    const currentSalaries = currentEntries
      .filter((e: any) => {
        const day = parseInt(e.date.split('.')[0])
        if (isFirstHalf) {
          return e.salary && day >= 1 && day <= Math.min(currentDay, 15) && day <= 15
        } else {
          return e.salary && day >= 16 && day <= currentDay
        }
      })
      .reduce((sum: any, e: any) => sum + e.salary, 0)

    const avgPerDay = currentPeriodDay > 0 ? currentRevenue / currentPeriodDay : 0
    const daysLeft = periodDays - currentPeriodDay
    const forecastValue = currentRevenue + (avgPerDay * daysLeft)
    
    // Прибыль = (выручка * 10%) - зарплаты
    const currentEarnings = (currentRevenue * 0.1) - currentSalaries
    const forecastEarnings = (forecastValue * 0.1) - currentSalaries

    return {
      current: currentRevenue,
      forecast: forecastValue,
      progress: (currentPeriodDay / periodDays) * 100,
      periodName: isFirstHalf ? '1-15' : '16-31',
      currentEarnings,
      forecastEarnings,
      currentSalaries
    }
  }, [entries])

  const analytics = useMemo(() => {
    const today = new Date()
    const currentMonth = format(today, 'yyyy-MM')
    const prevMonth = format(subMonths(today, 1), 'yyyy-MM')
    
    const currentEntries = entries[currentMonth] || []
    const prevEntries = entries[prevMonth] || []
    
    // Текущий месяц
    const currentRevenue = currentEntries
      .filter((e: any) => e.amount)
      .reduce((sum: any, e: any) => sum + e.amount, 0)
    
    // Зарплаты текущего месяца
    const currentSalaries = currentEntries
      .filter((e: any) => e.salary)
      .reduce((sum: any, e: any) => sum + e.salary, 0)
    
    const currentEarnings = (currentRevenue * 0.10) - currentSalaries
    
    // Прошлый месяц
    const prevRevenue = prevEntries
      .filter((e: any) => e.amount)
      .reduce((sum: any, e: any) => sum + e.amount, 0)
    
    const prevSalaries = prevEntries
      .filter((e: any) => e.salary)
      .reduce((sum: any, e: any) => sum + e.salary, 0)
    
    const prevEarnings = (prevRevenue * 0.10) - prevSalaries
    
    // Рост
    const revenueGrowth = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 
      : 0
    
    // Клиенты (из API)
    const totalClients = clientsCount
    
    // Средний чек
    const avgCheck = totalClients > 0 ? currentRevenue / totalClients : 0
    
    // Прогресс месяца
    const daysInMonth = getDaysInMonth(today)
    const currentDay = today.getDate()
    const monthProgress = (currentDay / daysInMonth) * 100
    
    // Прогноз на конец месяца
    const avgPerDay = currentDay > 0 ? currentRevenue / currentDay : 0
    const forecastRevenue = avgPerDay * daysInMonth
    const avgSalaryPerDay = currentDay > 0 ? currentSalaries / currentDay : 0
    const forecastSalaries = avgSalaryPerDay * daysInMonth
    const forecastEarnings = (forecastRevenue * 0.10) - forecastSalaries
    
    // Дней без записей
    const daysWithEntries = new Set(
      currentEntries
        .filter((e: any) => e.amount)
        .map((e: any) => e.date)
    ).size
    
    const activeDays = (daysWithEntries / currentDay) * 100
    
    // Топ клиент
    const clientRevenue = new Map()
    currentEntries
      .filter((e: any) => e.amount && e.symbols)
      .forEach((e: any) => {
        const normalizedName = normalizeClientName(e.symbols)
        const current = clientRevenue.get(normalizedName) || 0
        clientRevenue.set(normalizedName, current + e.amount)
      })
    
    const topClient = Array.from(clientRevenue.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    // Общие зарплаты (уже посчитаны выше как currentSalaries)
    const totalSalaries = currentSalaries
    
    return {
      currentRevenue,
      currentEarnings,
      prevRevenue,
      prevEarnings,
      revenueGrowth,
      totalClients,
      avgCheck,
      monthProgress,
      forecastRevenue,
      forecastEarnings,
      activeDays,
      topClient,
      totalSalaries,
      daysWithEntries,
      currentDay
    }
  }, [entries])

  const quickActions: QuickAction[] = [
    {
      title: 'Добавить запись',
      icon: <Bolt />,
      color: '#667eea',
      path: '/add',
      description: 'Быстрое добавление'
    },
    {
      title: 'Клиенты',
      icon: <People />,
      color: '#f093fb',
      path: '/clients',
      description: `${analytics.totalClients} активных`
    },
    {
      title: 'Календарь',
      icon: <CalendarMonth />,
      color: '#4facfe',
      path: `/year/${new Date().getFullYear()}`,
      description: 'Годовой обзор'
    },
    {
      title: 'Аналитика',
      icon: <Assessment />,
      color: '#fa709a',
      path: '/kpi/current',
      description: 'Полная статистика'
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            Главная
          </Typography>
          <Chip 
            icon={<Star sx={{ fill: '#FFD700' }} />}
            label="Premium" 
            size="small"
            sx={{ 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: 'white',
              fontWeight: 700
            }}
          />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ru })}
        </Typography>
      </Box>

      {/* Main Stats */}
      <Grid container spacing={3} mb={4}>
        {/* Оборот */}
        <Grid item xs={12} md={6}>
          <MotionCard
            whileHover={{ scale: 1.02, y: -4 }}
            onHoverStart={() => setHoveredCard('revenue')}
            onHoverEnd={() => setHoveredCard(null)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              height: '100%'
            }}
            onClick={() => navigate(`/month/${new Date().getFullYear()}/${new Date().getMonth() + 1}`)}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                transform: hoveredCard === 'revenue' ? 'scale(1.5)' : 'scale(1)'
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Оборот за период {forecast.periodName}
                  </Typography>
                  <Typography variant="h3" fontWeight={900} sx={{ mb: 1 }}>
                    <CountUp end={forecast.current} duration={2} separator=" " /> $
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {analytics.revenueGrowth >= 0 ? (
                      <TrendingUp sx={{ fontSize: 20 }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 20 }} />
                    )}
                    <Typography variant="body2">
                      {analytics.revenueGrowth >= 0 ? '+' : ''}
                      {analytics.revenueGrowth.toFixed(1)}% от прошлого периода
                    </Typography>
                  </Stack>
                </Box>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AttachMoney sx={{ fontSize: 32 }} />
                </Avatar>
              </Stack>
              
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Прогресс месяца</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {analytics.monthProgress.toFixed(0)}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.monthProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Заработок */}
        <Grid item xs={12} md={6}>
          <MotionCard
            whileHover={{ scale: 1.02, y: -4 }}
            onHoverStart={() => setHoveredCard('earnings')}
            onHoverEnd={() => setHoveredCard(null)}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              height: '100%'
            }}
            onClick={() => navigate('/kpi/current')}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                transform: hoveredCard === 'earnings' ? 'scale(1.5)' : 'scale(1)'
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Ваша прибыль за {forecast.periodName}
                  </Typography>
                  <Typography variant="h3" fontWeight={900} sx={{ mb: 1 }}>
                    <CountUp end={forecast.currentEarnings} duration={2} separator=" " decimals={2} /> $
                  </Typography>
                  <Typography variant="body2">
                    Прогноз на конец периода: {formatMoney(forecast.forecastEarnings)} $
                  </Typography>
                </Box>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <TrendingUp sx={{ fontSize: 32 }} />
                </Avatar>
              </Stack>
              
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Активность</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {analytics.daysWithEntries} из {analytics.currentDay} дней
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.activeDays} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Info Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.05 }}
            sx={{ cursor: 'pointer', height: '100%' }}
            onClick={() => navigate('/clients')}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  mx: 'auto', 
                  mb: 2,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                }}
              >
                <People sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={800} color="primary" mb={0.5}>
                {analytics.totalClients}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Клиентов
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.05 }}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  mx: 'auto', 
                  mb: 2,
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                }}
              >
                <Timer sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={800} color="primary" mb={0.5}>
                {formatMoney(analytics.avgCheck)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Средний чек
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.05 }}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  mx: 'auto', 
                  mb: 2,
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                }}
              >
                <Star sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography 
                variant="body1" 
                fontWeight={700} 
                color="primary" 
                mb={0.5}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {analytics.topClient ? analytics.topClient[0] : 'Нет данных'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Топ клиент (период {forecast.periodName})
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/history')}
            sx={{ cursor: 'pointer', height: '100%' }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  mx: 'auto', 
                  mb: 2,
                  background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
                }}
              >
                <AttachMoney sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={800} color="primary" mb={0.5}>
                {formatMoney(analytics.totalSalaries)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Выплаты ЗП
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} md={3} key={index}>
              <MotionCard
                whileHover={{ scale: 1.05, y: -4 }}
                onClick={() => navigate(action.path)}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(action.color, 0.25)}`
                  }
                }}
              >
                <CardContent sx={{ width: '100%', p: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(action.color, 0.1),
                      color: action.color,
                      width: 48,
                      height: 48,
                      mb: 2
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} mb={0.5}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Кнопка выхода */}
      <Box mt={6} mb={4} display="flex" justifyContent="center">
        <MotionCard
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptics.medium()
            localStorage.removeItem('salary_app_auth')
            localStorage.removeItem('biometric_enabled')
            window.location.reload()
          }}
          sx={{
            cursor: 'pointer',
            maxWidth: 400,
            width: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            border: '2px solid',
            borderColor: alpha('#f5576c', 0.3),
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 8px 24px ${alpha('#f5576c', 0.3)}`
            }
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} py={1}>
              <Logout sx={{ color: 'white', fontSize: 24 }} />
              <Typography variant="h6" fontWeight={700} color="white">
                Выйти из аккаунта
              </Typography>
            </Stack>
          </CardContent>
        </MotionCard>
      </Box>
    </Box>
  )
}
