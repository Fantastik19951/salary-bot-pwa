import { Box, Card, Typography, Stack } from '@mui/material'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface Props {
  data: { day: string; value: number }[]
  title: string
  color?: string
}

const MotionCard = motion(Card)

export default function TrendMiniChart({ data, title, color = '#667eea' }: Props) {
  const latestValue = data[data.length - 1]?.value || 0
  const prevValue = data[data.length - 2]?.value || 0
  const change = prevValue > 0 ? ((latestValue - prevValue) / prevValue) * 100 : 0

  return (
    <MotionCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      sx={{ p: 2.5, height: '100%' }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1} mt={0.5}>
            <Typography variant="h5" fontWeight={800} color="primary">
              {latestValue.toLocaleString()}
            </Typography>
            {change !== 0 && (
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  color: change > 0 ? 'success.main' : 'error.main'
                }}
              >
                {change > 0 ? '+' : ''}{change.toFixed(0)}%
              </Typography>
            )}
          </Stack>
        </Box>

        <Box sx={{ height: 60, mx: -1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Stack>
    </MotionCard>
  )
}
