import { Box, CircularProgress, Fade } from '@mui/material'
import { Check } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  loading: boolean
  success: boolean
}

export default function UpdateIndicator({ loading, success }: Props) {
  return (
    <AnimatePresence>
      {(loading || success) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 9999
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            {loading && <CircularProgress size={24} />}
            {success && !loading && (
              <Check sx={{ color: 'success.main', fontSize: 28 }} />
            )}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
