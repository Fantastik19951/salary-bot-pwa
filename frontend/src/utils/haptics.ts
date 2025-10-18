// Haptic Feedback утилиты для iOS и Android

// Расширяем Window для WebKit
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        haptic?: {
          postMessage: (message: any) => void
        }
      }
    }
  }
}

// Проверка iOS Haptic Engine
const triggerIOSHaptic = (style: 'light' | 'medium' | 'heavy') => {
  try {
    if (window.webkit?.messageHandlers?.haptic) {
      window.webkit.messageHandlers.haptic.postMessage({ style })
      return true
    }
  } catch (e) {
    // Игнорируем
  }
  return false
}

// Универсальная вибрация
const vibrate = (pattern: number | number[]) => {
  try {
    if ('vibrate' in navigator && navigator.vibrate) {
      // Проверяем что устройство поддерживает вибрацию
      const result = navigator.vibrate(pattern)
      return result
    }
  } catch (e) {
    // Игнорируем
  }
  return false
}

export const haptics = {
  // Лёгкая вибрация (клик)
  light: () => {
    if (!triggerIOSHaptic('light')) {
      vibrate(10)
    }
  },
  
  // Средняя вибрация (успех)
  medium: () => {
    if (!triggerIOSHaptic('medium')) {
      vibrate(30)
    }
  },
  
  // Сильная вибрация (важное действие)
  heavy: () => {
    if (!triggerIOSHaptic('heavy')) {
      vibrate(50)
    }
  },
  
  // Успех (паттерн)
  success: () => {
    vibrate([10, 50, 10])
  },
  
  // Ошибка (паттерн)
  error: () => {
    vibrate([50, 100, 50])
  },
  
  // Удаление (предупреждение)
  warning: () => {
    vibrate([30, 50, 30, 50, 30])
  }
}

// Проверка поддержки
export const isHapticsSupported = () => {
  return 'vibrate' in navigator || !!window.webkit?.messageHandlers?.haptic
}
