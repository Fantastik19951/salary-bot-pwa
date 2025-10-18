import { Box, Card, Stack, Skeleton } from '@mui/material'

export function PageLoadingSkeleton() {
  return (
    <Box>
      <Stack direction="row" spacing={2} mb={3}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box flex={1}>
          <Skeleton width="40%" height={32} />
          <Skeleton width="60%" height={20} />
        </Box>
      </Stack>
      
      <Stack spacing={2}>
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} sx={{ p: 2 }}>
            <Stack direction="row" spacing={2}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box flex={1}>
                <Skeleton width="60%" height={24} />
                <Skeleton width="40%" height={20} />
              </Box>
              <Skeleton width={100} height={24} />
            </Stack>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}

export function CardLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={48} height={48} />
            <Box flex={1}>
              <Skeleton width="50%" height={24} />
              <Skeleton width="70%" height={20} />
            </Box>
            <Skeleton width={80} height={32} />
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
