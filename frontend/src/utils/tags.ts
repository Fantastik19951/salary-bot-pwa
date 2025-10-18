// Автоматическое определение тегов на основе суммы, имени клиента и т.д.

export interface Tag {
  id: string
  name: string
  color: string
  icon: string
}

export const predefinedTags: Tag[] = [
  { id: 'urgent', name: 'Срочно', color: '#f44336', icon: '🔥' },
  { id: 'bonus', name: 'Бонус', color: '#4caf50', icon: '💰' },
  { id: 'regular', name: 'Постоянный', color: '#2196f3', icon: '⭐' },
  { id: 'new', name: 'Новый клиент', color: '#9c27b0', icon: '🆕' },
  { id: 'large', name: 'Крупная сумма', color: '#ff9800', icon: '💎' },
  { id: 'debt', name: 'Долг', color: '#f44336', icon: '⚠️' },
]

export const autoSuggestTags = (entry: any, allEntries: any[]): Tag[] => {
  const tags: Tag[] = []
  const amount = entry.amount || entry.salary || 0

  // Крупная сумма (больше 10000)
  if (amount > 10000) {
    tags.push(predefinedTags.find(t => t.id === 'large')!)
  }

  // Проверка на постоянного клиента (более 5 записей)
  const clientEntries = allEntries.filter((e: any) => 
    e.symbols?.toLowerCase() === entry.symbols?.toLowerCase()
  )
  if (clientEntries.length >= 5) {
    tags.push(predefinedTags.find(t => t.id === 'regular')!)
  }

  // Новый клиент (первая запись)
  if (clientEntries.length === 1) {
    tags.push(predefinedTags.find(t => t.id === 'new')!)
  }

  // Определение по ключевым словам
  const text = (entry.symbols || '').toLowerCase()
  if (text.includes('срочн') || text.includes('urgent')) {
    tags.push(predefinedTags.find(t => t.id === 'urgent')!)
  }
  if (text.includes('бонус') || text.includes('bonus')) {
    tags.push(predefinedTags.find(t => t.id === 'bonus')!)
  }
  if (text.includes('долг') || text.includes('debt')) {
    tags.push(predefinedTags.find(t => t.id === 'debt')!)
  }

  return tags
}

export const getTagsForClient = (clientName: string, entries: any[]): Tag[] => {
  const clientEntries = entries.filter((e: any) => 
    e.symbols?.toLowerCase() === clientName.toLowerCase()
  )

  const tags: Tag[] = []

  // Постоянный клиент
  if (clientEntries.length >= 5) {
    tags.push(predefinedTags.find(t => t.id === 'regular')!)
  }

  // Средняя сумма
  const avgAmount = clientEntries.reduce((sum, e) => sum + (e.amount || e.salary || 0), 0) / clientEntries.length
  if (avgAmount > 10000) {
    tags.push(predefinedTags.find(t => t.id === 'large')!)
  }

  return tags
}

export const saveCustomTag = (tag: Tag) => {
  const customTags = getCustomTags()
  customTags.push(tag)
  localStorage.setItem('custom_tags', JSON.stringify(customTags))
}

export const getCustomTags = (): Tag[] => {
  const saved = localStorage.getItem('custom_tags')
  return saved ? JSON.parse(saved) : []
}

export const getAllTags = (): Tag[] => {
  return [...predefinedTags, ...getCustomTags()]
}
