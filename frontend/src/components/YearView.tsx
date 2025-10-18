import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Button, Grid, IconButton } from '@mui/material'
import { ArrowBack, Home } from '@mui/icons-material'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export default function YearView() {
  const { year } = useParams()
  const navigate = useNavigate()

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2} gap={1}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700 }}>
          📆 {year}
        </Typography>
        <IconButton onClick={() => navigate('/')} color="primary">
          <Home />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {MONTH_NAMES.map((month, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(`/month/${year}/${index + 1}`)}
              sx={{ 
                py: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {month}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
