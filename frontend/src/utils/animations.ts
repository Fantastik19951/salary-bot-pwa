// Анимации для Framer Motion

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' }
}

export const slideIn = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
}

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

export const slideUp = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

// Анимация для добавления записи
export const entryAdded = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { 
    type: 'spring',
    stiffness: 300,
    damping: 20
  }
}

// Анимация для удаления
export const entryRemoved = {
  exit: { 
    x: 100, 
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

// Список с задержкой
export const staggerList = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
}
