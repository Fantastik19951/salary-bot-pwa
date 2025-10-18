import { useMemo } from 'react'
import { Card, Box, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useAppStore } from '../store/appStore'

export default function RevenueChart() {
  const { entries } = useAppStore()
  
  const chartData = useMemo(() => {
    const data: any[] = []
    const monthsData: Record<string, number> = {}
    
    // Собираем данные по месяцам
    Object.entries(entries).forEach(([period, periodEntries]) => {
      const monthRevenue = periodEntries
        .filter((e: any) => e.amount)
        .reduce((sum: number, e: any) => sum + e.amount, 0)
      
      if (monthRevenue > 0) {
        monthsData[period] = monthRevenue
      }
    })
    
    // Сортируем и берем последние 6 месяцев
    const sortedPeriods = Object.keys(monthsData).sort()
    const lastSix = sortedPeriods.slice(-6)
    
    lastSix.forEach(period => {
      const [year, month] = period.split('-')
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      
      data.push({
        name: monthNames[parseInt(month) - 1],
        value: Math.round(monthsData[period])
      })
    })
    
    return data
  }, [entries])
  
  if (chartData.length === 0) return null
  
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Динамика оборота
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#999" fontSize={12} />
          <YAxis stroke="#999" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              background: 'white', 
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12
            }}
            formatter={(value: any) => [`${value.toLocaleString()} $`, 'Оборот']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#667eea" 
            strokeWidth={3}
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
