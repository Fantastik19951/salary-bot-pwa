import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, Typography, IconButton, Stack, List, ListItem, ListItemText, Divider, Button } from '@mui/material'
import { ArrowBack, Home } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'

const MONTH_NAMES = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
]

const formatAmount = (x: number): string => {
  if (Math.abs(x - Math.floor(x)) < 1e-9) {
    return Math.floor(x).toLocaleString('ru-RU')
  }
  return x.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function HistoryView() {
  const navigate = useNavigate()
  const { entries } = useAppStore()
  const [showPenalties, setShowPenalties] = useState(false)

  const { mainEntries, penaltyEntries, total, penaltyTotal } = useMemo(() => {
    const allSalaries: any[] = []
    
    Object.values(entries).forEach(periodEntries => {
      periodEntries.forEach(e => {
        if (e.salary) {
          allSalaries.push(e)
        }
      })
    })

    const mainEntries = allSalaries.filter(e => e.salary >= 500)
    const penaltyEntries = allSalaries.filter(e => e.salary < 500)
    
    const total = mainEntries.reduce((sum, e) => sum + e.salary, 0)
    const penaltyTotal = penaltyEntries.reduce((sum, e) => sum + e.salary, 0)

    return { mainEntries, penaltyEntries, total, penaltyTotal }
  }, [entries])

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.').map(Number)
    return `${day} ${MONTH_NAMES[month - 1]} ${year}`
  }

  if (showPenalties) {
    return (
      <Stack spacing={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => setShowPenalties(false)} color="primary">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700 }}>
            ⚖️ ШТРАФЫ
          </Typography>
          <IconButton onClick={() => navigate('/')} color="primary">
            <Home />
          </IconButton>
        </Box>

        <Card>
          <CardContent>
            {penaltyEntries.length === 0 ? (
              <Typography align="center" color="text.secondary">
                📭 Нет данных о штрафах
              </Typography>
            ) : (
              <List>
                {penaltyEntries
                  .sort((a, b) => {
                    const [dayA, monthA, yearA] = a.date.split('.').map(Number)
                    const [dayB, monthB, yearB] = b.date.split('.').map(Number)
                    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
                  })
                  .map((entry, idx) => (
                    <Box key={idx}>
                      <ListItem>
                        <ListItemText
                          primary={formatDate(entry.date)}
                          secondary={
                            <Typography variant="body2" color="error" fontWeight={600}>
                              {formatAmount(entry.salary)} $
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < penaltyEntries.length - 1 && <Divider />}
                    </Box>
                  ))}
              </List>
            )}

            {penaltyEntries.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" px={2}>
                  <Typography variant="body1" fontWeight={700}>
                    💰 Сумма штрафов:
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="error">
                    {formatAmount(penaltyTotal)} $
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700 }}>
          📜 ИСТОРИЯ ВЫПЛАТ
        </Typography>
        <IconButton onClick={() => navigate('/')} color="primary">
          <Home />
        </IconButton>
      </Box>

      <Card>
        <CardContent>
          {mainEntries.length === 0 ? (
            <Typography align="center" color="text.secondary">
              📭 Нет данных о выплатах
            </Typography>
          ) : (
            <>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Основные выплаты:
              </Typography>
              <List>
                {mainEntries
                  .sort((a, b) => {
                    const [dayA, monthA, yearA] = a.date.split('.').map(Number)
                    const [dayB, monthB, yearB] = b.date.split('.').map(Number)
                    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
                  })
                  .map((entry, idx) => (
                    <Box key={idx}>
                      <ListItem>
                        <ListItemText
                          primary={formatDate(entry.date)}
                          secondary={
                            <Typography variant="body2" color="primary" fontWeight={600}>
                              {formatAmount(entry.salary)} $
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < mainEntries.length - 1 && <Divider />}
                    </Box>
                  ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" px={2}>
                <Typography variant="body1" fontWeight={700}>
                  💰 Общая сумма:
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  {formatAmount(total)} $
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {penaltyEntries.length > 0 && (
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setShowPenalties(true)}
        >
          ⚖️ Показать штрафы
        </Button>
      )}
    </Stack>
  )
}
