import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, Avatar, Chip, alpha, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { ArrowBack, AttachMoney, TrendingUp, Warning, CalendarMonth } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { useAppStore } from '../store/appStore'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export default function NewHistoryView() {
  const navigate = useNavigate()
  const { entries } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'salary' | 'penalty'>('all')

  const historyData = useMemo(() => {
    const allSalaries: any[] = []
    
    Object.values(entries).forEach((periodEntries: any) => {
      periodEntries.forEach((e: any) => {
        if (e.salary) {
          allSalaries.push(e)
        }
      })
    })

    const sortedSalaries = allSalaries.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').map(Number)
      const [dayB, monthB, yearB] = b.date.split('.').map(Number)
      const dateA = new Date(yearA, monthA - 1, dayA)
      const dateB = new Date(yearB, monthB - 1, dayB)
      return dateB.getTime() - dateA.getTime()
    })

    const mainPayments = sortedSalaries.filter(e => e.salary >= 500)
    const penalties = sortedSalaries.filter(e => e.salary < 500)
    
    const totalSalary = mainPayments.reduce((sum, e) => sum + e.salary, 0)
    const totalPenalty = penalties.reduce((sum, e) => sum + e.salary, 0)

    return {
      mainPayments,
      penalties,
      totalSalary,
      totalPenalty,
      allPayments: sortedSalaries
    }
  }, [entries])

  const displayedPayments = useMemo(() => {
    if (filter === 'salary') return historyData.mainPayments
    if (filter === 'penalty') return historyData.penalties
    return historyData.allPayments
  }, [filter, historyData])

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.').map(Number)
    const date = new Date(year, month - 1, day)
    return format(date, 'd MMMM yyyy', { locale: ru })
  }

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
            История выплат
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Все зарплаты и штрафы
          </Typography>
        </Box>
      </Stack>

      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
        <motion.div
          style={{ flex: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box p={4}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Всего выплачено
                  </Typography>
                  <Typography variant="h3" fontWeight={900}>
                    <CountUp end={historyData.totalSalary} duration={2} separator=" " /> $
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    {historyData.mainPayments.length} выплат
                  </Typography>
                </Box>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AttachMoney sx={{ fontSize: 28 }} />
                </Avatar>
              </Stack>
            </Box>
          </Card>
        </motion.div>

        {historyData.penalties.length > 0 && (
          <motion.div
            style={{ flex: 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <Box p={4}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Штрафы
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      <CountUp end={historyData.totalPenalty} duration={2} separator=" " /> $
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      {historyData.penalties.length} записей
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Warning sx={{ fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        )}
      </Stack>

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <Box p={3}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.5,
                border: '2px solid',
                borderColor: alpha('#667eea', 0.2),
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: '2px solid transparent',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }
                }
              }
            }}
          >
            <ToggleButton value="all">
              Все ({historyData.allPayments.length})
            </ToggleButton>
            <ToggleButton value="salary">
              Зарплаты ({historyData.mainPayments.length})
            </ToggleButton>
            <ToggleButton value="penalty">
              Штрафы ({historyData.penalties.length})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Card>

      {/* Payments List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Stack spacing={2}>
            {displayedPayments.length === 0 ? (
              <Card>
                <Box p={4} textAlign="center">
                  <Typography variant="body1" color="text.secondary">
                    Нет данных
                  </Typography>
                </Box>
              </Card>
            ) : (
              displayedPayments.map((payment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    sx={{ 
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <Box p={3}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar 
                          sx={{ 
                            width: 56,
                            height: 56,
                            background: payment.salary >= 500 
                              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                              : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                          }}
                        >
                          {payment.salary >= 500 ? (
                            <TrendingUp sx={{ fontSize: 28 }} />
                          ) : (
                            <Warning sx={{ fontSize: 28 }} />
                          )}
                        </Avatar>
                        
                        <Box flex={1}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                            <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(payment.date)}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" fontWeight={700}>
                            {payment.symbols || (payment.salary >= 500 ? 'Зарплата' : 'Штраф')}
                          </Typography>
                        </Box>
                        
                        <Box textAlign="right">
                          <Typography 
                            variant="h5" 
                            fontWeight={900}
                            sx={{
                              color: payment.salary >= 500 ? '#4facfe' : '#f5576c'
                            }}
                          >
                            {formatMoney(payment.salary)} $
                          </Typography>
                          <Chip 
                            label={payment.salary >= 500 ? 'Выплата' : 'Штраф'}
                            size="small"
                            sx={{
                              mt: 1,
                              background: payment.salary >= 500 
                                ? alpha('#4facfe', 0.1)
                                : alpha('#f5576c', 0.1),
                              color: payment.salary >= 500 ? '#4facfe' : '#f5576c',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                </motion.div>
              ))
            )}
          </Stack>
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}
