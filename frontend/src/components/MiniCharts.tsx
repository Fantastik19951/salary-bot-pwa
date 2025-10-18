import { useMemo } from 'react'
import { Box, Card, Typography, alpha } from '@mui/material'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useAppStore } from '../store/appStore'

export function WeeklySparkline() {
  const { entries } = useAppStore()
  
  if (!entries || Object.keys(entries).length === 0) {
    return (
      <Card sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Загрузка данных...
        </Typography>
      </Card>
    )
  }
  
  const weekData = useMemo(() => {
    const data = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
      
      const periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const dayEntries = entries[periodKey]?.filter((e: any) => e.date === dateStr) || []
      const revenue = dayEntries.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
      
      data.push({
        day: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()],
        value: revenue
      })
    }
    
    return data
  }, [entries])
  
  return (
    <Card sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>
        Неделя
      </Typography>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={weekData}>
          <defs>
            <linearGradient id="weekGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(0,0,0,0.8)', 
              border: 'none',
              borderRadius: 8,
              fontSize: '0.75rem'
            }}
            formatter={(value: any) => [`${value.toLocaleString()} $`, 'Оборот']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#fff" 
            strokeWidth={2}
            fill="url(#weekGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function ActivityHeatmap() {
  const { entries } = useAppStore()
  
  if (!entries || Object.keys(entries).length === 0) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Загрузка данных...
        </Typography>
      </Card>
    )
  }
  
  const heatmapData = useMemo(() => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const counts = [0, 0, 0, 0, 0, 0, 0]
    
    Object.values(entries).forEach((periodEntries: any) => {
      periodEntries.forEach((entry: any) => {
        if (entry.date && entry.amount) {
          const [d, m, y] = entry.date.split('.')
          const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
          const dayOfWeek = date.getDay()
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          counts[adjustedDay]++
        }
      })
    })
    
    const maxCount = Math.max(...counts, 1)
    
    return days.map((day, i) => ({
      day,
      count: counts[i],
      intensity: counts[i] / maxCount
    }))
  }, [entries])
  
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
        Активность по дням
      </Typography>
      <Box display="flex" gap={0.5}>
        {heatmapData.map((item) => (
          <Box key={item.day} flex={1} textAlign="center">
            <Box 
              sx={{ 
                height: 40, 
                borderRadius: 1,
                bgcolor: alpha('#667eea', Math.max(item.intensity * 0.8, 0.1)),
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" fontWeight={700} color={item.intensity > 0.5 ? 'white' : 'text.secondary'}>
                {item.count}
              </Typography>
            </Box>
            <Typography variant="caption" fontSize="0.65rem" color="text.secondary">
              {item.day}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}
