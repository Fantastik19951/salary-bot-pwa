// Нормализация имени клиента
export const normalizeClientName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
    .toUpperCase() // Приводим к верхнему регистру для группировки
}

// Получить оригинальное имя (для отображения)
export const getDisplayName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ')
}
