import { useState } from 'react'
import { TextField, InputAdornment, IconButton, Chip, Stack, Box, alpha } from '@mui/material'
import { Search, Clear, FilterList } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestions?: string[]
}

export default function EnhancedSearchBar({ value, onChange, placeholder, suggestions }: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder || 'Поиск...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: focused ? 'primary.main' : 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onChange('')}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s',
            background: focused ? alpha('#667eea', 0.05) : 'white',
            '& fieldset': {
              borderColor: focused ? '#667eea' : alpha('#000', 0.23),
              borderWidth: focused ? 2 : 1,
            },
            '&:hover fieldset': {
              borderColor: '#667eea'
            }
          }
        }}
      />

      <AnimatePresence>
        {focused && suggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" gap={1}>
              {suggestions.map((suggestion, idx) => (
                <Chip
                  key={idx}
                  label={suggestion}
                  size="small"
                  onClick={() => onChange(suggestion)}
                  sx={{
                    bgcolor: alpha('#667eea', 0.1),
                    '&:hover': {
                      bgcolor: alpha('#667eea', 0.2)
                    }
                  }}
                />
              ))}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
