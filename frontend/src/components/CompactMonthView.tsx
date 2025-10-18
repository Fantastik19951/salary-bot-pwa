import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, Avatar, Chip, alpha, ButtonGroup, Button } from '@mui/material'
import { ArrowBack, CalendarMonth } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(Math.floor(amount))

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
]

export default function CompactMonthView() {
  const { year, month } = useParams<{ year: string; month: string }>()
  const navigate = useNavigate()
  const { entries } = useAppStore()
  const [half, setHalf] = useState<'first' | 'second' | 'all'>('all')

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

    const daysMap = new Map<string, { amount: number; count: number }>()
    filtered.forEach((e: any) => {
      const current = daysMap.get(e.date) || { amount: 0, count: 0 }
      daysMap.set(e.date, {
        amount: current.amount + e.amount,
        count: current.count + 1
      })
    })

    const days = Array.from(daysMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => {
        const [dayA] = a.date.split('.').map(Number)
        const [dayB] = b.date.split('.').map(Number)
        return dayB - dayA
      })

    const totalRevenue = days.reduce((sum, d) => sum + d.amount, 0)
    const totalTransactions = days.reduce((sum, d) => sum + d.count, 0)

    return { days, stats: { totalRevenue, totalTransactions } }
  }, [monthEntries, half])

  const monthName = MONTH_NAMES[parseInt(month!) - 1]

  return (
    <Box>
      {/* Компактный хедер */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
        <IconButton 
          size="small"
          onClick={() => navigate(`/year/${year}`)}
          sx={{ bgcolor: alpha('#667eea', 0.08) }}
        >
          <ArrowBack fontSize="small" sx={{ color: '#667eea' }} />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700}>
            {MONTH_NAMES[parseInt(month!) - 1]} {year}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
            {days.length} дней с записями
          </Typography>
        </Box>
      </Stack>

      {/* Красивые фильтры */}
      <Stack direction="row" spacing={1} mb={2.5}>
        <ButtonGroup size="small" fullWidth sx={{ height: { xs: 32, sm: 36 } }}>
          <Button
            onClick={() => setHalf('first')}
            sx={{
              flex: 1,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: half === 'first' ? 700 : 500,
              background: half === 'first' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
              color: half === 'first' ? 'white' : 'text.secondary',
              border: `1px solid ${half === 'first' ? 'transparent' : alpha('#000', 0.12)} !important`,
              '&:hover': {
                background: half === 'first' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : alpha('#667eea', 0.05)
              }
            }}
          >
            1-15
          </Button>
          <Button
            onClick={() => setHalf('second')}
            sx={{
              flex: 1,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: half === 'second' ? 700 : 500,
              background: half === 'second' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
              color: half === 'second' ? 'white' : 'text.secondary',
              border: `1px solid ${half === 'second' ? 'transparent' : alpha('#000', 0.12)} !important`,
              '&:hover': {
                background: half === 'second'
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : alpha('#f093fb', 0.05)
              }
            }}
          >
            16-31
          </Button>
          <Button
            onClick={() => setHalf('all')}
            sx={{
              flex: 1,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: half === 'all' ? 700 : 500,
              background: half === 'all' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'white',
              color: half === 'all' ? 'white' : 'text.secondary',
              border: `1px solid ${half === 'all' ? 'transparent' : alpha('#000', 0.12)} !important`,
              '&:hover': {
                background: half === 'all'
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  : alpha('#4facfe', 0.05)
              }
            }}
          >
            Всё
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Компактная статистика */}
      <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} mb={2.5}>
        <Card sx={{ flex: 1, background: GRADIENTS[0], p: { xs: 1.25, sm: 1.5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                Оборот
              </Typography>
              <Typography variant="h6" fontWeight={800} color="white" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }} noWrap>
                {formatMoney(stats.totalRevenue)} $
              </Typography>
            </Box>
            <CalendarMonth sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: 24, sm: 28 } }} />
          </Stack>
        </Card>
        
        <Card sx={{ flex: 1, background: GRADIENTS[1], p: { xs: 1.25, sm: 1.5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                Заработок
              </Typography>
              <Typography variant="h6" fontWeight={800} color="white" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }} noWrap>
                {formatMoney(stats.totalRevenue * 0.1)} $
              </Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>💰</Typography>
          </Stack>
        </Card>
      </Stack>

      {/* Компактный список дней */}
      <Stack spacing={1}>
        {days.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h4" mb={1}>📭</Typography>
            <Typography color="text.secondary" fontSize="0.875rem">
              Нет записей
            </Typography>
          </Box>
        ) : (
          days.map((day, idx) => {
            const dayNum = parseInt(day.date.split('.')[0])
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    bgcolor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(idx % 4 === 0 ? '#667eea' : idx % 4 === 1 ? '#f093fb' : idx % 4 === 2 ? '#4facfe' : '#43e97b', 0.04),
                      transform: 'translateX(4px)'
                    }
                  }}
                  onClick={() => {
                    const [d, m, y] = day.date.split('.')
                    navigate(`/day/${y}/${parseInt(m)}/${parseInt(d)}`)
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }} p={{ xs: 1.25, sm: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        background: GRADIENTS[idx % 4],
                        fontWeight: 800,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                    >
                      {dayNum}
                    </Avatar>
                    
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {day.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                        {day.count} {day.count === 1 ? 'запись' : day.count < 5 ? 'записи' : 'записей'}
                      </Typography>
                    </Box>
                    
                    <Stack alignItems="flex-end" spacing={0.25}>
                      <Typography variant="body1" fontWeight={700} color="primary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                        {formatMoney(day.amount)} $
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                        +{formatMoney(day.amount * 0.1)} $
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            )
          })
        )}
      </Stack>
    </Box>
  )
}
