import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, Typography, Stack, IconButton, TextField, Button, alpha, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material'
import { ArrowBack, Check, Delete, Preview } from '@mui/icons-material'
import { useAppStore } from '../store/appStore'
import { haptics } from '../utils/haptics'

interface ParsedEntry {
  name: string
  amount: number
  valid: boolean
}

export default function BulkAddEntry() {
  const navigate = useNavigate()
  const { addEntry, syncData } = useAppStore()
  
  const [bulkText, setBulkText] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  })
  const [previewing, setPreviewing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Парсинг строк
  const parseLines = (text: string): ParsedEntry[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // "5000 Иванов" или "Иванов 5000"
        const match1 = line.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
        if (match1) {
          return {
            amount: parseFloat(match1[1]),
            name: match1[2].trim(),
            valid: true
          }
        }

        const match2 = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/)
        if (match2) {
          return {
            amount: parseFloat(match2[2]),
            name: match2[1].trim(),
            valid: true
          }
        }

        return {
          name: line,
          amount: 0,
          valid: false
        }
      })
  }

  const parsedEntries = parseLines(bulkText)
  const validEntries = parsedEntries.filter(e => e.valid)
  const totalAmount = validEntries.reduce((sum, e) => sum + e.amount, 0)

  const handleBulkAdd = async () => {
    if (validEntries.length === 0) {
      haptics.error()
      return
    }

    setIsAdding(true)
    haptics.success()
    
    const [year, month, day] = date.split('-')
    const formattedDate = `${day}.${month}.${year}`

    try {
      for (const entry of validEntries) {
        await addEntry({
          date: formattedDate,
          symbols: entry.name,
          amount: entry.amount
        })
        // Небольшая задержка для стабильности
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      await syncData()
      haptics.success()
      navigate(`/day/${year}/${month}/${day}`)
    } catch (error) {
      console.error('Ошибка массового добавления:', error)
      haptics.error()
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Box>
      {/* Хедер */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <IconButton 
          size="small"
          onClick={() => navigate(-1)}
          sx={{ bgcolor: alpha('#f093fb', 0.08) }}
        >
          <ArrowBack fontSize="small" sx={{ color: '#f093fb' }} />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Массовое добавление
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Вставь список записей (по одной на строку)
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2.5}>
        {/* Форма ввода */}
        <Card sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Дата */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
                Дата для всех записей
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>

            {/* Текстовое поле */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block" fontSize="0.7rem">
                Записи (по одной на строку)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={12}
                placeholder={`5000 Иванов\n3000 Петров\n7500 Сидоров\n...\n\nИли:\n\nИванов 5000\nПетров 3000\nСидоров 7500`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                inputRef={textareaRef}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    fontFamily: 'monospace'
                  }
                }}
              />
            </Box>

            {/* Статистика */}
            {parsedEntries.length > 0 && (
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip 
                  label={`Всего: ${parsedEntries.length}`}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={`Валидных: ${validEntries.length}`}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                {parsedEntries.length !== validEntries.length && (
                  <Chip 
                    label={`Ошибок: ${parsedEntries.length - validEntries.length}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                <Chip 
                  label={`Сумма: $${totalAmount.toLocaleString()}`}
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                  size="small"
                />
              </Stack>
            )}

            {/* Кнопки */}
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant={previewing ? 'outlined' : 'contained'}
                size="large"
                disabled={parsedEntries.length === 0}
                onClick={() => setPreviewing(!previewing)}
                startIcon={<Preview />}
                sx={{
                  py: 1.25,
                  borderRadius: 2,
                  background: previewing ? 'white' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:disabled': {
                    background: alpha('#000', 0.12)
                  }
                }}
              >
                {previewing ? 'Скрыть превью' : 'Показать превью'}
              </Button>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={validEntries.length === 0 || isAdding}
                onClick={handleBulkAdd}
                startIcon={<Check />}
                sx={{
                  py: 1.25,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:disabled': {
                    background: alpha('#000', 0.12)
                  }
                }}
              >
                {isAdding ? 'Добавляю...' : `Добавить (${validEntries.length})`}
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* Превью */}
        {previewing && parsedEntries.length > 0 && (
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Превью записей
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Имя</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Сумма</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedEntries.map((entry, idx) => (
                    <TableRow 
                      key={idx}
                      sx={{
                        bgcolor: entry.valid ? 'transparent' : alpha('#ff0000', 0.05)
                      }}
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {entry.valid ? `$${entry.amount.toLocaleString()}` : '—'}
                      </TableCell>
                      <TableCell align="center">
                        {entry.valid ? (
                          <Chip label="✓" color="success" size="small" sx={{ minWidth: 50 }} />
                        ) : (
                          <Chip label="✗" color="error" size="small" sx={{ minWidth: 50 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Подсказки */}
        <Card sx={{ p: 2, bgcolor: alpha('#667eea', 0.05) }}>
          <Typography variant="caption" fontSize="0.75rem" color="text.secondary">
            <strong>💡 Формат:</strong><br/>
            • Каждая запись на новой строке<br/>
            • "сумма имя" или "имя сумма"<br/>
            • Пример: "5000 Иванов" или "Петров 3000"<br/>
            • Можно вставить из Excel/Google Sheets
          </Typography>
        </Card>
      </Stack>
    </Box>
  )
}
