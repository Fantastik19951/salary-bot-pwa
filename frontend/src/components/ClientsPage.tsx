import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, Avatar, TextField, InputAdornment, Grid, Chip, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Button, LinearProgress } from '@mui/material'
import { ArrowBack, Search, Person, AttachMoney, TrendingUp, Add, Phone, Email } from '@mui/icons-material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { useAppStore } from '../store/appStore'
import { normalizeClientName, getDisplayName } from '../utils/normalize'

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#fa709a', '#00c853', '#ffc658', '#ff7c7c', '#89f7fe']

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(Math.floor(amount))
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const { entries } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const clientsData = useMemo(() => {
    const clientsMap = new Map<string, any>()
    
    Object.entries(entries).forEach(([period, periodEntries]) => {
      (periodEntries as any[]).forEach((e: any) => {
        if (e.amount && e.symbols) {
          const normalizedName = normalizeClientName(e.symbols)
          const displayName = getDisplayName(e.symbols)
          
          const client = clientsMap.get(normalizedName) || {
            name: displayName,
            totalRevenue: 0,
            transactions: [],
            lastDate: e.date,
            periods: new Set()
          }
          
          client.totalRevenue += e.amount
          client.transactions.push({ ...e, period })
          client.periods.add(period)
          
          const [day1, month1, year1] = e.date.split('.').map(Number)
          const [day2, month2, year2] = client.lastDate.split('.').map(Number)
          const date1 = new Date(year1, month1 - 1, day1)
          const date2 = new Date(year2, month2 - 1, day2)
          
          if (date1 > date2) {
            client.lastDate = e.date
          }
          
          clientsMap.set(normalizedName, client)
        }
      })
    })
    
    return Array.from(clientsMap.values())
      .map(client => ({
        ...client,
        avgTransaction: client.totalRevenue / client.transactionCount,
        periodsCount: client.periods.size
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [entries])

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clientsData
    const query = searchQuery.toLowerCase().replace(/\s+/g, '')
    return clientsData.filter(client => {
      const nameNormalized = client.name.toLowerCase().replace(/\s+/g, '')
      return nameNormalized.includes(query)
    })
  }, [clientsData, searchQuery])

  const stats = useMemo(() => {
    const totalRevenue = filteredClients.reduce((sum, c) => sum + c.totalRevenue, 0)
    const avgRevenue = filteredClients.length > 0 ? totalRevenue / filteredClients.length : 0
    
    const topClients = filteredClients.slice(0, 8).map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      value: c.totalRevenue
    }))
    
    return { totalRevenue, avgRevenue, topClients }
  }, [filteredClients])

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
            База клиентов
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredClients.length} {filteredClients.length === 1 ? 'клиент' : 'клиентов'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/add')}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 3
          }}
        >
          Добавить
        </Button>
      </Stack>

      {/* Search */}
      <Box mb={4}>
        <TextField
          fullWidth
          placeholder="Поиск клиента..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              bgcolor: 'white',
              '& fieldset': { borderWidth: 2 }
            }
          }}
        />
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Box p={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Всего клиентов
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      <CountUp end={filteredClients.length} duration={2} />
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Person sx={{ fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Box p={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Общий оборот
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      <CountUp end={stats.totalRevenue} duration={2} separator=" " /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <Box p={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Средний оборот
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      <CountUp end={stats.avgRevenue} duration={2} separator=" " /> $
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <TrendingUp sx={{ fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Chart */}
        {stats.topClients.length > 0 && (
          <Grid item xs={12} lg={5}>
            <Card>
              <Box p={3}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  📊 Топ клиенты
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topClients}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.topClients.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${formatMoney(value)} $`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        )}

        {/* Clients List */}
        <Grid item xs={12} lg={stats.topClients.length > 0 ? 7 : 12}>
          <Card>
            <Box p={3}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Список клиентов
              </Typography>
              <Stack spacing={2}>
                <AnimatePresence>
                  {filteredClients.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">Клиенты не найдены</Typography>
                    </Box>
                  ) : (
                    filteredClients.map((client, index) => {
                      const percentage = (client.totalRevenue / stats.totalRevenue) * 100
                      return (
                        <motion.div
                          key={client.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            elevation={0}
                            sx={{ 
                              bgcolor: 'grey.50',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: 'grey.100',
                                transform: 'translateX(8px)'
                              }
                            }}
                            onClick={() => setSelectedClient(client)}
                          >
                            <Box p={2}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar 
                                  sx={{ 
                                    width: 48,
                                    height: 48,
                                    bgcolor: COLORS[index % COLORS.length],
                                    fontWeight: 700
                                  }}
                                >
                                  {client.name.charAt(0).toUpperCase()}
                                </Avatar>
                                
                                <Box flex={1}>
                                  <Typography variant="h6" fontWeight={700}>
                                    {client.name}
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                                    <Chip size="small" label={`${client.transactions.length} сделок`} />
                                    <Chip size="small" label={`${formatMoney(client.avgTransaction)} $ средний`} />
                                    <Chip size="small" label={client.lastDate} icon={<AttachMoney />} />
                                  </Stack>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={percentage} 
                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                                
                                <Box textAlign="right">
                                  <Typography variant="h5" fontWeight={800} color="primary">
                                    {formatMoney(client.totalRevenue)} $
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {percentage.toFixed(1)}% от общего
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Card>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Client Details Dialog */}
      <Dialog 
        open={!!selectedClient} 
        onClose={() => setSelectedClient(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        {selectedClient && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar 
                  sx={{ 
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  {selectedClient.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    {selectedClient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Клиент с {selectedClient.lastDate}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Card elevation={0} sx={{ bgcolor: alpha('#667eea', 0.1), p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Всего оборот</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary">
                      {formatMoney(selectedClient.totalRevenue)} $
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card elevation={0} sx={{ bgcolor: alpha('#f093fb', 0.1), p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Сделок</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary">
                      {selectedClient.transactions.length}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={700} mb={2}>
                История транзакций
              </Typography>
              <Stack spacing={1} maxHeight={300} overflow="auto">
                {selectedClient.transactions
                  .sort((a: any, b: any) => {
                    const [d1, m1, y1] = a.date.split('.').map(Number)
                    const [d2, m2, y2] = b.date.split('.').map(Number)
                    return new Date(y2, m2-1, d2).getTime() - new Date(y1, m1-1, d1).getTime()
                  })
                  .map((t: any, i: number) => (
                    <Card key={i} elevation={0} sx={{ bgcolor: 'grey.50', p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{t.date}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.period}</Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={700} color="primary">
                          {formatMoney(t.amount)} $
                        </Typography>
                      </Stack>
                    </Card>
                  ))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setSelectedClient(null)} size="large">
                Закрыть
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
