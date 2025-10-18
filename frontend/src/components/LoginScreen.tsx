import { useState, useEffect } from 'react'
import { Box, Card, TextField, Button, Typography, Stack } from '@mui/material'
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { motion } from 'framer-motion'
import { haptics } from '../utils/haptics'

interface Props {
  onLogin: () => void
}

const CORRECT_PASSWORD = '1750'

export default function LoginScreen({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  useEffect(() => {
    const auth = localStorage.getItem('salary_app_auth')
    if (auth === 'true') {
      onLogin()
    }
  }, [onLogin])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === CORRECT_PASSWORD) {
      haptics.success()
      localStorage.setItem('salary_app_auth', 'true')
      onLogin()
    } else {
      haptics.error()
      setError(true)
      setShake(true)
      setTimeout(() => {
        setShake(false)
        setError(false)
      }, 500)
      setPassword('')
    }
  }
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: shake ? [-10, 10, -10, 10, 0] : 0
        }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          sx={{ 
            p: 4, 
            maxWidth: 400, 
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Lock sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography variant="h4" fontWeight={800} textAlign="center">
              Salary Bot PWA
            </Typography>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Введите пароль для доступа к приложению
            </Typography>
            
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type={showPassword ? 'tel' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (e.target.value.length === 1) haptics.light()
                  }}
                  onFocus={() => haptics.light()}
                  placeholder="Введите пароль"
                  error={error}
                  helperText={error ? 'Неверный пароль' : ''}
                  autoFocus
                  autoComplete="off"
                  inputMode="numeric"
                  inputProps={{
                    pattern: '[0-9]*',
                    maxLength: 4,
                    inputMode: 'numeric'
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!password}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    }
                  }}
                >
                  Войти
                </Button>
              </Stack>
            </form>
            
            <Typography variant="caption" color="text.secondary">
              Hint: пароль из 4 цифр
            </Typography>
          </Stack>
        </Card>
      </motion.div>
    </Box>
  )
}
