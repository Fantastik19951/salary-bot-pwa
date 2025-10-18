import { Box, Card, Typography, Stack, RadioGroup, FormControlLabel, Radio, alpha, Grid } from '@mui/material'
import { Palette, Check } from '@mui/icons-material'
import { availableThemes } from '../theme/themes'

interface ThemeSettingsProps {
  currentTheme: string
  onThemeChange: (themeId: string) => void
}

export default function ThemeSettings({ currentTheme, onThemeChange }: ThemeSettingsProps) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Palette sx={{ color: '#667eea', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Темы оформления
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Выбери цветовую схему приложения
          </Typography>
        </Box>
      </Stack>

      <RadioGroup value={currentTheme} onChange={(e) => onThemeChange(e.target.value)}>
        <Grid container spacing={1.5}>
          {availableThemes.map((theme) => (
            <Grid item xs={6} sm={6} md={4} key={theme.id}>
              <Card
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  cursor: 'pointer',
                  border: `2px solid ${currentTheme === theme.id ? theme.preview.primary : 'transparent'}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => onThemeChange(theme.id)}
              >
                <FormControlLabel
                  value={theme.id}
                  control={
                    <Radio
                      sx={{
                        color: theme.preview.primary,
                        '&.Mui-checked': {
                          color: theme.preview.primary
                        }
                      }}
                    />
                  }
                  label={
                    <Stack spacing={1.5} width="100%">
                      <Typography variant="body2" fontWeight={600} fontSize={{ xs: '0.75rem', sm: '0.875rem' }}>
                        {theme.name}
                      </Typography>
                      
                      {/* Color Preview */}
                      <Stack direction="row" spacing={1}>
                        <Box
                          sx={{
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {currentTheme === theme.id && (
                            <Check sx={{ color: 'white', fontSize: 20 }} />
                          )}
                        </Box>
                        
                        <Stack spacing={0.5} flex={1}>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 1,
                              bgcolor: theme.preview.primary,
                              width: '100%'
                            }}
                          />
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 1,
                              bgcolor: theme.preview.secondary,
                              width: '80%'
                            }}
                          />
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 1,
                              bgcolor: alpha(theme.preview.primary, 0.3),
                              width: '60%'
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>

      <Card sx={{ p: 3, mt: 3, bgcolor: alpha('#667eea', 0.05) }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>Совет:</strong> Выбранная тема применится ко всему приложению. Изменения сохраняются автоматически.
        </Typography>
      </Card>
    </Box>
  )
}
