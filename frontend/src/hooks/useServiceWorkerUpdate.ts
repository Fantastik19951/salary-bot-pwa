import { useEffect, useRef } from 'react'

export const useServiceWorkerUpdate = () => {
  const refreshingRef = useRef(false)
  const firstLoadRef = useRef(!navigator.serviceWorker?.controller)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    const updateRegistrations = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.update()))
      } catch (error) {
        console.error('Ошибка проверки обновлений SW:', error)
      }
    }

    const interval = window.setInterval(updateRegistrations, 30000)

    const handleControllerChange = () => {
      if (firstLoadRef.current) {
        firstLoadRef.current = false
        return
      }

      if (refreshingRef.current) {
        return
      }

      refreshingRef.current = true
      window.setTimeout(() => {
        window.location.reload()
      }, 500)
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    updateRegistrations()

    return () => {
      window.clearInterval(interval)
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])
}
