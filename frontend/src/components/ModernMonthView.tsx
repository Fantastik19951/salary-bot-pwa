import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, alpha, Grid, Chip, Avatar, Divider } from '@mui/material'
import { ArrowBack, CalendarMonth, TrendingUp, AttachMoney } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { useAppStore } from '../store/appStore'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(Math.floor(amount))
}

export default function ModernMonthView() {
  const { year, month } = useParams<{ year: string; month: string }>()
  const navigate = useNavigate()
  const { entries } = useAppStore()
  
  const [half, setHalf] = useState<'first' | 'second' | 'all'>(() => {
    const today = new Date()
    if (today.getFullYear() === parseInt(year!) && today.getMonth() + 1 === parseInt(month!)) {
      return today.getDate() <= 15 ? 'first' : 'second'
    }
    return 'all'
  })

  const periodKey = `${year}-${month!.padStart(2, '0')}`
  const monthEntries = entries[periodKey] || []

  const { days, stats } = useMemo(() => {
    const filtered = monthEntries.filter((e: any) => {
      if (!e.amount) return false
      const day = parseInt(e.date.split('.')[0])
      if (half === 'first') return day <= 15
      if (half === 'second') return day > 15
      return true
    })

    const daysMap = new Map<string, { amount: number; count: number; entries: any[] }>()
    filtered.forEach((e: any) => {
      const current = daysMap.get(e.date) || { amount: 0, count: 0, entries: [] }
      daysMap.set(e.date, {
        amount: current.amount + (e.amount || 0),
        count: current.count + 1,
        entries: [...current.entries, e]
      })
    })

    const days = Array.from(daysMap.entries())
      .map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count,
        earnings: data.amount * 0.10,
        entries: data.entries
      }))
      .sort((a, b) => {
        const [dayA] = a.date.split('.').map(Number)
        const [dayB] = b.date.split('.').map(Number)
        return dayB - dayA // Сортировка по убыванию
      })

    const totalRevenue = days.reduce((sum, d) => sum + d.amount, 0)
    const totalEarnings = totalRevenue * 0.10
    const avgPerDay = days.length > 0 ? totalRevenue / days.length : 0
    const totalTransactions = days.reduce((sum, d) => sum + d.count, 0)

    return { 
      days, 
      stats: { totalRevenue, totalEarnings, avgPerDay, totalTransactions }
    }
  }, [monthEntries, half])

  const monthName = MONTH_NAMES[parseInt(month!) - 1]

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
        <Box flex={1}>
          <Typography variant="h4" fontWeight={800}>
            {monthName} {year}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {days.length} дней с записями
          </Typography>
        </Box>
      </Stack>

      {/* Period Selector */}
      <Stack direction="row" spacing={1} mb={4}>
        {[
          { value: 'first', label: '1-15 число', icon: '📅' },
          { value: 'second', label: '16-31 число', icon: '📆' },
          { value: 'all', label: 'Весь месяц', icon: '🗓️' }
        ].map(period => (
          <Chip
            key={period.value}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <span>{period.icon}</span>
                <span>{period.label}</span>
              </Stack>
            }
            onClick={() => setHalf(period.value as any)}
            sx={{
              flex: 1,
              height: 44,
              borderRadius: 3,
              fontSize: '0.875rem',
              fontWeight: half === period.value ? 700 : 500,
              bgcolor: half === period.value ? alpha('#667eea', 0.15) : 'grey.100',
              color: half === period.value ? '#667eea' : 'text.secondary',
              border: half === period.value ? `2px solid #667eea` : '2px solid transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: half === period.value ? alpha('#667eea', 0.2) : 'grey.200'
              }
            }}
          />
        ))}
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Box p={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Оборот
                    </Typography>
                    <Typography variant="h5" fontWeight={900}>
                      <CountUp end={stats.totalRevenue} duration={1.5} separator=" " /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AttachMoney fontSize="small" />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Box p={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Заработок
                    </Typography>
                    <Typography variant="h5" fontWeight={900}>
                      <CountUp end={stats.totalEarnings} duration={1.5} separator=" " decimals={2} /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <TrendingUp fontSize="small" />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <Box p={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Средний день
                    </Typography>
                    <Typography variant="h5" fontWeight={900}>
                      <CountUp end={stats.avgPerDay} duration={1.5} separator=" " /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <CalendarMonth fontSize="small" />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <Box p={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Транзакций
                    </Typography>
                    <Typography variant="h5" fontWeight={900}>
                      <CountUp end={stats.totalTransactions} duration={1.5} />
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Typography fontWeight={900}>💰</Typography>
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Days List */}
      <Card>
        <Box p={3}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            📅 Дни месяца
          </Typography>
          
          {days.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h3" mb={2}>📭</Typography>
              <Typography color="text.secondary" mb={3}>
                Нет записей за выбранный период
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              <AnimatePresence>
                {days.map((day, index) => {
                  const [d, m, y] = day.date.split('.').map(Number)
                  const date = new Date(y, m - 1, d)
                  const dayName = format(date, 'EEEE', { locale: ru })
                  
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card 
                        elevation={0}
                        sx={{ 
                          bgcolor: 'grey.50',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha('#667eea', 0.05),
                            transform: 'translateX(8px)',
                            boxShadow: `0 4px 20px ${alpha('#667eea', 0.15)}`
                          }
                        }}
                        onClick={() => {
                          const [d, m, y] = day.date.split('.')
                          navigate(`/day/${y}/${parseInt(m)}/${parseInt(d)}`)
                        }}
                      >
                        <Box p={2.5}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar 
                              sx={{ 
                                width: 56,
                                height: 56,
                                background: `linear-gradient(135deg, ${
                                  index % 4 === 0 ? '#667eea, #764ba2' :
                                  index % 4 === 1 ? '#f093fb, #f5576c' :
                                  index % 4 === 2 ? '#4facfe, #00f2fe' :
                                  '#fa709a, #fee140'
                                })`,
                                fontWeight: 900,
                                fontSize: '1.25rem'
                              }}
                            >
                              {d}
                            </Avatar>
                            
                            <Box flex={1}>
                              <Typography variant="h6" fontWeight={700}>
                                {dayName}, {day.date}
                              </Typography>
                              <Stack direction="row" spacing={1} mt={0.5}>
                                <Chip 
                                  size="small" 
                                  label={`${day.count} ${day.count === 1 ? 'запись' : day.count < 5 ? 'записи' : 'записей'}`}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  size="small" 
                                  label={`${formatMoney(day.earnings)} $ заработок`}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                  color="success"
                                />
                              </Stack>
                            </Box>
                            
                            <Box textAlign="right">
                              <Typography variant="h5" fontWeight={900} color="primary">
                                {formatMoney(day.amount)} $
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                оборот
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  )
}
