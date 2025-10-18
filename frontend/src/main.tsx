import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ruRU } from '@mui/material/locale'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8b9cf4',
      dark: '#4a5ba3',
    },
    secondary: {
      main: '#f093fb',
      light: '#f5a4fb',
      dark: '#a866b0',
    },
    success: {
      main: '#00c853',
    },
    info: {
      main: '#00b0ff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.04)',
    '0 4px 8px rgba(0,0,0,0.06)',
    '0 8px 16px rgba(0,0,0,0.08)',
    '0 12px 24px rgba(0,0,0,0.10)',
    '0 16px 32px rgba(0,0,0,0.12)',
    '0 20px 40px rgba(0,0,0,0.14)',
    '0 24px 48px rgba(0,0,0,0.16)',
    '0 28px 56px rgba(0,0,0,0.18)',
    '0 32px 64px rgba(0,0,0,0.20)',
    '0 36px 72px rgba(0,0,0,0.22)',
    '0 40px 80px rgba(0,0,0,0.24)',
    '0 44px 88px rgba(0,0,0,0.26)',
    '0 48px 96px rgba(0,0,0,0.28)',
    '0 52px 104px rgba(0,0,0,0.30)',
    '0 56px 112px rgba(0,0,0,0.32)',
    '0 60px 120px rgba(0,0,0,0.34)',
    '0 64px 128px rgba(0,0,0,0.36)',
    '0 68px 136px rgba(0,0,0,0.38)',
    '0 72px 144px rgba(0,0,0,0.40)',
    '0 76px 152px rgba(0,0,0,0.42)',
    '0 80px 160px rgba(0,0,0,0.44)',
    '0 84px 168px rgba(0,0,0,0.46)',
    '0 88px 176px rgba(0,0,0,0.48)',
    '0 92px 184px rgba(0,0,0,0.50)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
}, ruRU)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('✅ SW зарегистрирован:', registration.scope)
      },
      (err) => {
        console.log('❌ SW ошибка:', err)
      }
    )
  })
}
