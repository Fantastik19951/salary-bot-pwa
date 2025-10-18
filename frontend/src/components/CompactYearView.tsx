import { useMemo, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, Avatar, alpha, CircularProgress, Button } from '@mui/material'
import { ArrowBack, TrendingUp, Download } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { exportYearToPDF } from '../utils/exportPDF'
import { haptics } from '../utils/haptics'

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const MONTH_NAMES_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(Math.floor(amount))

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
]

export default function CompactYearView() {
  const { year } = useParams<{ year: string }>()
  const navigate = useNavigate()
  const { entries, syncData } = useAppStore()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      await syncData()
      setLoading(false)
    }
    loadData()
  }, [syncData])
  
  console.log('CompactYearView - Year:', year)
  console.log('CompactYearView - Entries keys:', Object.keys(entries))

  const { months, yearTotal } = useMemo(() => {
    const monthsData = []
    let total = 0

    for (let m = 1; m <= 12; m++) {
      const periodKey = `${year}-${m.toString().padStart(2, '0')}`
      const periodEntries = entries[periodKey] || []
      
      console.log(`Month ${m} (${periodKey}):`, periodEntries.length, 'entries')
      
      const monthRevenue = periodEntries
        .filter((e: any) => e.amount)
        .reduce((sum: number, e: any) => sum + e.amount, 0)
      
      const monthCount = periodEntries.filter((e: any) => e.amount).length
      
      total += monthRevenue
      
      monthsData.push({
        month: m,
        name: MONTH_NAMES[m - 1],
        shortName: MONTH_NAMES_SHORT[m - 1],
        revenue: monthRevenue,
        count: monthCount,
        earnings: monthRevenue * 0.1
      })
    }

    return { months: monthsData.reverse(), yearTotal: total }
  }, [entries, year])
  
  const handleExport = () => {
    haptics.success()
    exportYearToPDF(year || '2025', months, { totalRevenue: yearTotal })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Компактный хедер */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
        <IconButton 
          size="small"
          onClick={() => navigate('/')}
          sx={{ bgcolor: alpha('#667eea', 0.08) }}
        >
          <ArrowBack fontSize="small" sx={{ color: '#667eea' }} />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            {year}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            12 месяцев
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          PDF
        </Button>
      </Stack>

      {/* Компактная статистика года */}
      <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} mb={2.5}>
        <Card sx={{ flex: 1, background: GRADIENTS[0], p: { xs: 1.25, sm: 1.5 } }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
            Годовой оборот
          </Typography>
          <Typography variant="h6" fontWeight={800} color="white" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }} noWrap>
            {formatMoney(yearTotal)} $
          </Typography>
        </Card>
        
        <Card sx={{ flex: 1, background: GRADIENTS[1], p: { xs: 1.25, sm: 1.5 } }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
            Заработок
          </Typography>
          <Typography variant="h6" fontWeight={800} color="white" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }} noWrap>
            {formatMoney(yearTotal * 0.1)} $
          </Typography>
        </Card>
      </Stack>

      {/* Компактный список месяцев */}
      <Stack spacing={1}>
        {months.map((month, idx) => {
          const hasData = month.revenue > 0
          
          return (
            <motion.div
              key={month.month}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  bgcolor: hasData ? 'white' : alpha('#000', 0.02),
                  cursor: hasData ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  opacity: hasData ? 1 : 0.5,
                  '&:hover': hasData ? {
                    bgcolor: alpha('#667eea', 0.04),
                    transform: 'translateX(4px)'
                  } : {}
                }}
                onClick={() => hasData && navigate(`/month/${year}/${month.month}`)}
              >
                <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }} p={{ xs: 1.25, sm: 1.5 }}>
                  <Avatar 
                    sx={{ 
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      background: hasData ? GRADIENTS[idx % 6] : alpha('#000', 0.1),
                      fontWeight: 700,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    {month.shortName}
                  </Avatar>
                  
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {month.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                      {hasData ? `${month.count} записей` : 'Нет данных'}
                    </Typography>
                  </Box>
                  
                  {hasData && (
                    <Stack alignItems="flex-end" spacing={0.25}>
                      <Typography variant="body1" fontWeight={700} color="primary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                        {formatMoney(month.revenue)} $
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <TrendingUp sx={{ fontSize: { xs: 10, sm: 12 }, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                          {formatMoney(month.earnings)} $
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </motion.div>
          )
        })}
      </Stack>
    </Box>
  )
}
