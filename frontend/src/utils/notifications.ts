// Smart уведомления

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        // Показываем тестовое уведомление
        sendNotification('✅ Уведомления включены', {
          body: 'Теперь вы будете получать напоминания',
          tag: 'welcome'
        })
        return true
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  return false
}

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    })
  }
}

// Умные уведомления
export const smartNotifications = {
  // Напоминание добавить запись
  dailyReminder: () => {
    const lastEntry = localStorage.getItem('last_entry_date')
    const today = new Date().toISOString().split('T')[0]
    
    if (lastEntry !== today) {
      sendNotification('📝 Пора добавить запись', {
        body: 'Не забудьте добавить записи за сегодня',
        tag: 'daily-reminder'
      })
    }
  },

  // Достижение цели
  goalAchieved: (percentage: number) => {
    if (percentage >= 80 && percentage < 100) {
      sendNotification('🎯 Почти у цели!', {
        body: `Вы достигли ${percentage}% от цели месяца`,
        tag: 'goal-progress'
      })
    } else if (percentage >= 100) {
      sendNotification('🎉 Цель достигнута!', {
        body: 'Поздравляем! Вы выполнили цель месяца',
        tag: 'goal-achieved'
      })
    }
  },

  // Новый ТОП клиент
  topClient: (clientName: string, amount: number) => {
    sendNotification('⭐ Новый ТОП клиент!', {
      body: `${clientName}: ${amount.toLocaleString()} $`,
      tag: 'top-client'
    })
  },

  // Еженедельный отчет
  weeklyReport: (revenue: number, change: number) => {
    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️'
    const changeText = change > 0 ? `+${change}%` : `${change}%`
    
    sendNotification(`${emoji} Недельный отчет`, {
      body: `Оборот: ${revenue.toLocaleString()} $ (${changeText})`,
      tag: 'weekly-report'
    })
  }
}

// Планировщик уведомлений
export const scheduleNotifications = () => {
  // Проверяем разрешения
  if (Notification.permission !== 'granted') {
    console.log('Notifications not granted')
    return
  }

  // Напоминание в указанное время
  const scheduleDaily = () => {
    const reminderTime = localStorage.getItem('reminder_time') || '20:00'
    const [hours, minutes] = reminderTime.split(':').map(Number)
    
    const now = new Date()
    const reminder = new Date()
    reminder.setHours(hours, minutes, 0, 0)
    
    if (now > reminder) {
      reminder.setDate(reminder.getDate() + 1)
    }
    
    const timeUntilReminder = reminder.getTime() - now.getTime()
    
    console.log(`Next reminder in ${Math.round(timeUntilReminder / 1000 / 60)} minutes`)
    
    setTimeout(() => {
      smartNotifications.dailyReminder()
      // Перепланируем на следующий день
      scheduleDaily()
    }, timeUntilReminder)
  }
  
  scheduleDaily()
}

// Отмена напоминаний
export const cancelNotifications = () => {
  // Очистка всех timeoutов (при необходимости)
  console.log('Notifications cancelled')
}
