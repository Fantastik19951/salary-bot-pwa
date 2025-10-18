import { Box, Card, Skeleton, Stack } from '@mui/material'

export function EntryCardSkeleton() {
  return (
    <Card sx={{ p: 2, mb: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Skeleton variant="circular" width={44} height={44} />
        <Box flex={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
        <Box textAlign="right">
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="text" width={150} height={48} sx={{ mt: 1 }} />
            <Skeleton variant="text" width={120} height={20} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="circular" width={56} height={56} />
        </Stack>
      </Box>
    </Card>
  )
}

export function ClientCardSkeleton() {
  return (
    <Card sx={{ mb: 2 }}>
      <Box p={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box flex={1}>
            <Skeleton variant="text" width="50%" height={24} />
            <Skeleton variant="text" width="30%" height={20} />
          </Box>
          <Skeleton variant="text" width={80} height={32} />
        </Stack>
      </Box>
    </Card>
  )
}

export function DayViewSkeleton() {
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={2} mb={4}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box flex={1}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
        <Skeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: 2 }} />
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </Stack>

      {/* Entries */}
      <Card>
        <Box p={3}>
          <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
          <EntryCardSkeleton />
          <EntryCardSkeleton />
          <EntryCardSkeleton />
        </Box>
      </Card>
    </Box>
  )
}

export function ClientsPageSkeleton() {
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={2} mb={4}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box flex={1}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="30%" height={24} />
        </Box>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={4}>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </Stack>

      {/* Search */}
      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 3 }} />

      {/* Clients */}
      <ClientCardSkeleton />
      <ClientCardSkeleton />
      <ClientCardSkeleton />
      <ClientCardSkeleton />
    </Box>
  )
}
