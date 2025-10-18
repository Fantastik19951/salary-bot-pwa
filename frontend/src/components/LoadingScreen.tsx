import { Box, CircularProgress, Typography } from '@mui/material'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        flexDirection: 'column',
        gap: 3
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: 'white',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: 'white', textAlign: 'center' }}
        >
          Загрузка...
        </Typography>
      </motion.div>
    </Box>
  )
}
