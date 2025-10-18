import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, Avatar, LinearProgress, Grid, Chip, alpha } from '@mui/material'
import { ArrowBack, TrendingUp, CalendarMonth, AttachMoney, Assessment, EmojiEvents } from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useAppStore } from '../store/appStore'
import { format, getDaysInMonth, subMonths } from 'date-fns'

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function NewKPIView() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { entries } = useAppStore()

  const kpiData = useMemo(() => {
    const today = new Date()
    const isCurrent = type === 'current'
    
    let targetMonth: Date
    if (isCurrent) {
      targetMonth = today
    } else {
      targetMonth = subMonths(today, 1)
    }
    
    const monthKey = format(targetMonth, 'yyyy-MM')
    const monthEntries = entries[monthKey] || []
    
    // Оборот и заработок
    const revenue = monthEntries
      .filter((e: any) => e.amount)
      .reduce((sum: any, e: any) => sum + e.amount, 0)
    
    const earnings = revenue * 0.10
    
    // Дни с записями
    const daysWithData = new Set(
      monthEntries
        .filter((e: any) => e.amount)
        .map((e: any) => e.date)
    ).size
    
    const totalDays = getDaysInMonth(targetMonth)
    const progress = (daysWithData / totalDays) * 100
    
    // Средний доход в день
    const avgPerDay = daysWithData > 0 ? earnings / daysWithData : 0
    
    // Прогноз
    const forecast = isCurrent ? avgPerDay * totalDays : null
    
    // График по дням
    const dailyData = []
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${day.toString().padStart(2, '0')}.${format(targetMonth, 'MM.yyyy')}`
      const dayRevenue = monthEntries
        .filter((e: any) => e.date === dateStr && e.amount)
        .reduce((sum: any, e: any) => sum + e.amount, 0)
      
      dailyData.push({
        day: day,
        revenue: dayRevenue,
        earnings: dayRevenue * 0.10
      })
    }
    
    // Клиенты
    const clients = new Set(
      monthEntries
        .filter((e: any) => e.amount && e.symbols)
        .map((e: any) => e.symbols)
    ).size
    
    // Средний чек
    const avgCheck = clients > 0 ? revenue / clients : 0
    
    return {
      revenue,
      earnings,
      daysWithData,
      totalDays,
      progress,
      avgPerDay,
      forecast,
      dailyData,
      clients,
      avgCheck,
      monthName: format(targetMonth, 'LLLL yyyy')
    }
  }, [entries, type])

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
            {type === 'current' ? 'Текущий KPI' : 'Прошлый KPI'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {kpiData.monthName}
          </Typography>
        </Box>
      </Stack>

      {/* Main Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                height: '100%'
              }}
            >
              <Box p={4}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Оборот
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      <CountUp end={kpiData.revenue} duration={2} separator=" " /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Avatar>
                </Stack>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 2 }}>
                  <Typography variant="body2" mb={1}>
                    {kpiData.clients} клиентов · Средний чек: {formatMoney(kpiData.avgCheck)} $
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                height: '100%'
              }}
            >
              <Box p={4}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Заработок (10%)
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      <CountUp end={kpiData.earnings} duration={2} separator=" " decimals={2} /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <TrendingUp sx={{ fontSize: 28 }} />
                  </Avatar>
                </Stack>
                {kpiData.forecast && (
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 2 }}>
                    <Typography variant="body2" mb={1}>
                      Прогноз: {formatMoney(kpiData.forecast)} $
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card sx={{ mb: 4 }}>
          <Box p={4}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Avatar sx={{ bgcolor: alpha('#4facfe', 0.1) }}>
                <CalendarMonth sx={{ color: '#4facfe' }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700}>
                  Прогресс периода
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Заполнено {kpiData.daysWithData} из {kpiData.totalDays} дней
                </Typography>
              </Box>
              <Chip 
                label={`${kpiData.progress.toFixed(0)}%`}
                sx={{ 
                  bgcolor: alpha('#4facfe', 0.1),
                  color: '#4facfe',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  px: 2,
                  py: 3
                }}
              />
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={kpiData.progress} 
              sx={{ 
                height: 16, 
                borderRadius: 8,
                bgcolor: alpha('#4facfe', 0.1),
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: 8
                }
              }}
            />
          </Box>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={3}>
          <Card>
            <Box p={3} textAlign="center">
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: alpha('#fa709a', 0.1) }}>
                <Assessment sx={{ color: '#fa709a' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={800} color="primary">
                {formatMoney(kpiData.avgPerDay)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Средний/день
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <Box p={3} textAlign="center">
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: alpha('#667eea', 0.1) }}>
                <CalendarMonth sx={{ color: '#667eea' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={800} color="primary">
                {kpiData.daysWithData}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Активных дней
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <Box p={3} textAlign="center">
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: alpha('#4facfe', 0.1) }}>
                <TrendingUp sx={{ color: '#4facfe' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={800} color="primary">
                {kpiData.clients}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Клиентов
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card>
            <Box p={3} textAlign="center">
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: alpha('#f093fb', 0.1) }}>
                <EmojiEvents sx={{ color: '#f093fb' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={800} color="primary">
                {formatMoney(kpiData.avgCheck)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Средний чек
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <Box p={4}>
            <Typography variant="h6" fontWeight={700} mb={3}>
              📊 Динамика по дням месяца
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={kpiData.dailyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#999"
                  label={{ value: 'День месяца', position: 'insideBottom', offset: -5 }}
                />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value: number) => `${formatMoney(value)} $`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Оборот"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </motion.div>
    </Box>
  )
}
