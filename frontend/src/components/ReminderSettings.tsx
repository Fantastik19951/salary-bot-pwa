import { useState, useEffect } from 'react'
import { Box, Card, Typography, Stack, Switch, FormControlLabel, TextField, Button, alpha, Chip } from '@mui/material'
import { Notifications, Schedule, NotificationsActive } from '@mui/icons-material'
import { requestNotificationPermission, scheduleNotifications, cancelNotifications } from '../utils/notifications'

export default function ReminderSettings() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('reminders_enabled') === 'true'
  })
  
  const [time, setTime] = useState(() => {
    return localStorage.getItem('reminder_time') || '20:00'
  })

  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleEnableReminders = async (checked: boolean) => {
    if (checked) {
      const hasPermission = await requestNotificationPermission()
      if (hasPermission) {
        setEnabled(true)
        localStorage.setItem('reminders_enabled', 'true')
        setPermission('granted')
        // Запускаем планировщик
        scheduleNotifications()
      } else {
        alert('Для напоминаний нужно разрешить уведомления в настройках браузера')
      }
    } else {
      setEnabled(false)
      localStorage.setItem('reminders_enabled', 'false')
      cancelNotifications()
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    localStorage.setItem('reminder_time', newTime)
    // Перепланируем напоминания
    if (enabled && permission === 'granted') {
      cancelNotifications()
      scheduleNotifications()
    }
  }

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🔔 Тестовое уведомление', {
        body: 'Напоминания настроены правильно!',
        icon: '/icon-192.png'
      })
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <NotificationsActive sx={{ color: '#667eea', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Напоминания
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Настройка уведомлений о добавлении записей
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        {/* Основной свитч */}
        <Card sx={{ p: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => handleEnableReminders(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#667eea',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#667eea',
                  },
                }}
              />
            }
            label={
              <Stack>
                <Typography variant="body1" fontWeight={600}>
                  Включить напоминания
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ежедневное напоминание добавить записи
                </Typography>
              </Stack>
            }
          />
        </Card>

        {/* Время напоминания */}
        {enabled && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Schedule sx={{ color: 'text.secondary' }} />
                <Typography variant="body1" fontWeight={600}>
                  Время напоминания
                </Typography>
              </Stack>
              
              <TextField
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2
                  }
                }}
              />

              <Typography variant="caption" color="text.secondary">
                Напоминание будет приходить каждый день в {time}
              </Typography>
            </Stack>
          </Card>
        )}

        {/* Статус разрешений */}
        <Card 
          sx={{ 
            p: 3,
            background: permission === 'granted' 
              ? alpha('#4caf50', 0.1) 
              : permission === 'denied'
              ? alpha('#f44336', 0.1)
              : alpha('#ff9800', 0.1)
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Notifications sx={{ 
                color: permission === 'granted' ? '#4caf50' : permission === 'denied' ? '#f44336' : '#ff9800'
              }} />
              <Typography variant="body1" fontWeight={600}>
                Статус разрешений
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={
                  permission === 'granted' 
                    ? '✓ Разрешено' 
                    : permission === 'denied'
                    ? '✗ Запрещено'
                    : '⚠ Не настроено'
                }
                color={
                  permission === 'granted' 
                    ? 'success' 
                    : permission === 'denied'
                    ? 'error'
                    : 'warning'
                }
                size="small"
              />
            </Stack>

            {permission === 'denied' && (
              <Typography variant="caption" color="error">
                Уведомления заблокированы. Разрешите их в настройках браузера.
              </Typography>
            )}

            {permission === 'granted' && (
              <Button
                variant="outlined"
                size="small"
                onClick={testNotification}
                sx={{ alignSelf: 'flex-start' }}
              >
                Тестовое уведомление
              </Button>
            )}
          </Stack>
        </Card>

        {/* Типы напоминаний */}
        {enabled && (
          <Card sx={{ p: 3 }}>
            <Typography variant="body1" fontWeight={600} mb={2}>
              Что будет напоминать:
            </Typography>
            
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">📝</Typography>
                <Typography variant="body2">Добавить записи за день</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">🎯</Typography>
                <Typography variant="body2">Прогресс достижения цели</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">📊</Typography>
                <Typography variant="body2">Еженедельный отчет (воскресенье)</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">⭐</Typography>
                <Typography variant="body2">Новые достижения</Typography>
              </Stack>
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  )
}
