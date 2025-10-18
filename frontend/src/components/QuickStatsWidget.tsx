import { Box, Card, Typography, Stack, LinearProgress, Chip, alpha } from '@mui/material'
import { TrendingUp, EmojiEvents, LocalFireDepartment } from '@mui/icons-material'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

interface Props {
  currentRevenue: number
  dailyGoal?: number
  weekRevenue: number
  streak: number
}

const MotionCard = motion(Card)

export default function QuickStatsWidget({ currentRevenue, dailyGoal = 5000, weekRevenue, streak }: Props) {
  const goalProgress = (currentRevenue / dailyGoal) * 100
  const isGoalReached = goalProgress >= 100

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        p: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }}
      />

      <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            ⚡ Сегодня
          </Typography>
          {streak > 0 && (
            <Chip
              icon={<LocalFireDepartment sx={{ fontSize: 16, color: 'white !important' }} />}
              label={`${streak} дней подряд`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
          )}
        </Stack>

        {/* Revenue & Goal */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1}>
            <Typography variant="h3" fontWeight={900}>
              <CountUp end={currentRevenue} duration={2} separator=" " /> $
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Цель: {dailyGoal.toLocaleString()} $
            </Typography>
          </Stack>
          
          <LinearProgress
            variant="determinate"
            value={Math.min(goalProgress, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.25)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white',
                borderRadius: 4,
              }
            }}
          />
          
          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {goalProgress.toFixed(0)}% от цели
            </Typography>
            {isGoalReached && (
              <Typography variant="caption" fontWeight={700}>
                🎯 Цель достигнута!
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Week Stats */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            p: 2
          }}
        >
          <Box flex={1}>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5 }}>
              За неделю
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {weekRevenue.toLocaleString()} $
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5 }}>
              Среднее/день
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {Math.round(weekRevenue / 7).toLocaleString()} $
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </MotionCard>
  )
}
