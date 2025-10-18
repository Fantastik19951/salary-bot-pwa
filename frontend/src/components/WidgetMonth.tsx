import { useEffect, useState } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { useAppStore } from '../store/appStore'

export default function WidgetMonth() {
  const { entries, syncData } = useAppStore()
  const [monthTotal, setMonthTotal] = useState(0)
  const [monthSalary, setMonthSalary] = useState(0)

  useEffect(() => {
    syncData()
  }, [syncData])

  useEffect(() => {
    const today = new Date()
    const key = `${today.getMonth() + 1}.${today.getFullYear()}`
    const monthEntries = entries[key] || []
    
    const totals = monthEntries.reduce((acc: any, e: any) => {
      if (e.amount) acc.amount += e.amount
      if (e.salary) acc.salary += e.salary
      return acc
    }, { amount: 0, salary: 0 })
    
    setMonthTotal(totals.amount)
    setMonthSalary(totals.salary)
  }, [entries])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white'
      }}
    >
      <Typography variant="caption" fontSize="0.75rem" sx={{ opacity: 0.9 }}>
        Этот месяц
      </Typography>
      
      <Stack spacing={1}>
        <Box>
          <Typography variant="caption" fontSize="0.65rem" sx={{ opacity: 0.8 }}>
            Оборот
          </Typography>
          <Typography variant="h5" fontWeight={800}>
            ${monthTotal.toLocaleString()}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="caption" fontSize="0.65rem" sx={{ opacity: 0.8 }}>
            Зарплата
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ opacity: 0.95 }}>
            ${monthSalary.toLocaleString()}
          </Typography>
        </Box>
      </Stack>
      
      <Typography variant="caption" fontSize="0.65rem" sx={{ opacity: 0.7, textAlign: 'right' }}>
        Salary Bot
      </Typography>
    </Box>
  )
}
