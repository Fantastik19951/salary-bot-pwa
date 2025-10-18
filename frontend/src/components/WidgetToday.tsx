import { useEffect, useState } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { useAppStore } from '../store/appStore'

export default function WidgetToday() {
  const { entries, syncData } = useAppStore()
  const [todayTotal, setTodayTotal] = useState(0)

  useEffect(() => {
    syncData()
  }, [syncData])

  useEffect(() => {
    const today = new Date()
    const key = `${today.getMonth() + 1}.${today.getFullYear()}`
    const todayEntries = entries[key] || []
    
    const todayStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`
    
    const total = todayEntries
      .filter((e: any) => e.date === todayStr)
      .reduce((sum: number, e: any) => {
        if (e.amount) return sum + e.amount
        if (e.salary) return sum + e.salary
        return sum
      }, 0)
    
    setTodayTotal(total)
  }, [entries])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}
    >
      <Typography variant="caption" fontSize="0.7rem" sx={{ opacity: 0.9, mb: 0.5 }}>
        Сегодня
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
        ${todayTotal.toLocaleString()}
      </Typography>
      <Typography variant="caption" fontSize="0.65rem" sx={{ opacity: 0.8 }}>
        Salary Bot
      </Typography>
    </Box>
  )
}
