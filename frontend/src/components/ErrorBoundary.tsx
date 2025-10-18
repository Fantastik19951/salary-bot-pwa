import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Button, Typography, Paper } from '@mui/material'
import { Refresh, BugReport } from '@mui/icons-material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary caught:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Логируем в localStorage для дебага
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
      localStorage.setItem('last_error', JSON.stringify(errorLog))
    } catch (e) {
      console.error('Не удалось сохранить ошибку:', e)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleClearCache = async () => {
    try {
      // Очищаем все кэши
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      
      // Удаляем Service Worker
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(reg => reg.unregister()))
      
      // Очищаем localStorage
      localStorage.clear()
      
      // Перезагружаем
      window.location.reload()
    } catch (error) {
      console.error('Ошибка очистки:', error)
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
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
          <Paper
            elevation={10}
            sx={{
              maxWidth: 500,
              width: '100%',
              p: 4,
              textAlign: 'center'
            }}
          >
            <BugReport sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Упс! Что-то сломалось
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Приложение столкнулось с ошибкой. Попробуйте перезагрузить страницу.
            </Typography>

            {this.state.error && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'grey.100',
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack.substring(0, 500)}`}
                </Typography>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                  }
                }}
              >
                Перезагрузить
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={this.handleClearCache}
                color="error"
              >
                Очистить кэш и перезагрузить
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              Если проблема повторяется, попробуйте очистить кэш
            </Typography>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
