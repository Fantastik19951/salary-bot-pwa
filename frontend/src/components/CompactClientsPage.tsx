import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Card, Typography, Stack, TextField, InputAdornment, 
  IconButton, alpha, Skeleton 
} from '@mui/material'
import { 
  Search, ArrowBack, ExpandMore
} from '@mui/icons-material'

const formatMoney = (amount: number) => new Intl.NumberFormat('ru-RU').format(Math.floor(amount))

// Максимально оптимизированная карточка без анимаций
const ClientCard = memo(({ client, expanded, onToggle }: any) => {
  // Только 3 транзакции для максимальной скорости
  const topTransactions = client.transactions?.slice(0, 3) || []
  
  return (
    <Card sx={{ mb: 1, boxShadow: 0, border: '1px solid', borderColor: alpha('#667eea', 0.1) }}>
      <Box 
        onClick={onToggle}
        sx={{ 
          p: 1.5, 
          cursor: 'pointer',
          bgcolor: expanded ? alpha('#667eea', 0.03) : 'white',
          '&:active': { bgcolor: alpha('#667eea', 0.05) }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box 
            sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%',
              bgcolor: client.isNickname ? '#667eea' : '#f5576c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            {client.name[0].toUpperCase()}
          </Box>
          
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {client.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              {client.transactionCount} • {formatMoney(client.avgTransaction)} $
            </Typography>
          </Box>
          
          <Box textAlign="right">
            <Typography variant="body1" fontWeight={800} color="primary" fontSize="0.95rem">
              {formatMoney(client.totalRevenue)} $
            </Typography>
          </Box>
          
          <Box sx={{ 
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'flex'
          }}>
            <ExpandMore sx={{ fontSize: 20 }} />
          </Box>
        </Stack>
      </Box>
      
      {/* Простой conditional render без анимаций */}
      {expanded && (
        <Box sx={{ bgcolor: alpha('#667eea', 0.02), p: 1.5, borderTop: '1px solid', borderColor: alpha('#667eea', 0.1) }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.5} display="block" fontSize="0.7rem">
            {client.transactionCount > 3 ? `Топ-3 из ${client.transactionCount}` : `${client.transactionCount} транзакций`}
          </Typography>
          {topTransactions.map((tx: any, idx: number) => (
            <Box 
              key={idx}
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.5,
                borderBottom: idx < topTransactions.length - 1 ? '1px solid' : 'none',
                borderColor: alpha('#000', 0.05)
              }}
            >
              <Typography variant="caption" fontSize="0.7rem">
                {tx.date}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="primary" fontSize="0.75rem">
                {formatMoney(tx.amount)} $
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  )
}, (prev, next) => prev.expanded === next.expanded && prev.client.id === next.client.id)

export default function CompactClientsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  
  const handleToggle = useCallback((clientId: string) => {
    setExpandedClient(prev => prev === clientId ? null : clientId)
  }, [])

  useEffect(() => {
    let mounted = true
    
    const loadClients = async () => {
      try {
        const res = await fetch('/api/clients/analytics')
        const data = await res.json()
        
        if (mounted) {
          setClients(data.clients || [])
          setStats(data.stats || {})
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading clients:', err)
        if (mounted) setLoading(false)
      }
    }
    
    loadClients()
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    if (!searchQuery) return clients
    const query = searchQuery.toLowerCase().replace(/\s+/g, '')
    return clients.filter(c => {
      const nameNormalized = c.name.toLowerCase().replace(/\s+/g, '')
      return nameNormalized.includes(query)
    })
  }, [clients, searchQuery])

  if (loading) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={800}>
            Клиенты
          </Typography>
        </Stack>
        <Stack spacing={2}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rounded" height={60} sx={{ flex: 1 }} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={48} sx={{ mb: 2.5 }} />
        <Stack spacing={1}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} variant="rounded" height={70} />
          ))}
        </Stack>
      </Box>
    )
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
            Клиенты
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            {filtered.length} • {stats?.nicknameCount} ников • {stats?.nameCount} людей
          </Typography>
        </Box>
      </Stack>

      {/* Компактная статистика */}
      <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} mb={2.5}>
        <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: { xs: 1.25, sm: 1.5 } }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
            Всего
          </Typography>
          <Typography variant="h6" fontWeight={800} color="white" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {stats?.totalClients}
          </Typography>
        </Card>
        
        <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', p: { xs: 1.25, sm: 1.5 } }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
            Оборот
          </Typography>
          <Typography variant="h6" fontWeight={800} color="white" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }} noWrap>
            {formatMoney(stats?.totalRevenue || 0)} $
          </Typography>
        </Card>
        
        <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', p: { xs: 1.25, sm: 1.5 } }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
            Средний
          </Typography>
          <Typography variant="h6" fontWeight={800} color="white" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }} noWrap>
            {formatMoney(stats?.avgRevenue || 0)} $
          </Typography>
        </Card>
      </Stack>

      {/* Компактный поиск с подсказками */}
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск по имени..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>✕</Typography>
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ 
          mb: 2.5, 
          bgcolor: 'white',
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s',
            '&:focus-within': {
              bgcolor: alpha('#667eea', 0.03),
              '& fieldset': {
                borderColor: '#667eea',
                borderWidth: 2
              }
            }
          }
        }}
      />

      {/* Список клиентов */}
      <Box>
        {filtered.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchQuery ? 'Клиенты не найдены' : 'Нет клиентов'}
            </Typography>
          </Card>
        ) : (
          filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              expanded={expandedClient === client.id}
              onToggle={() => handleToggle(client.id)}
            />
          ))
        )}
      </Box>

    </Box>
  )
}
