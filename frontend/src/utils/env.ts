// Используем ТОЛЬКО переменные окружения, без автоопределения
// Railway передаёт их во время сборки. Фоллбек — прод-домен backend.
const PROD_API = 'https://web-production-b5bd5.up.railway.app'
const PROD_WS = 'wss://web-production-b5bd5.up.railway.app'

export const API_URL = import.meta.env.VITE_API_URL || PROD_API
export const WS_URL = import.meta.env.VITE_WS_URL || PROD_WS
