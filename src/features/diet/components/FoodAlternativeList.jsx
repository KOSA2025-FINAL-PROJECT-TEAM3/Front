import { Box, Paper, Stack, Typography } from '@mui/material'

export const FoodAlternativeList = ({ items = [] }) => {
  if (!items.length) return null

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h6" sx={{ m: 0, fontSize: 18, fontWeight: 900, color: 'text.primary' }}>
        대체 음식 제안
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 1.5,
        }}
      >
        {items.map((item) => (
          <Paper
            key={item.id}
            component="article"
            variant="outlined"
            sx={{ borderRadius: 4, p: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}
          >
            <Box
              aria-hidden
              sx={{
                width: 42,
                height: 42,
                borderRadius: 3,
                bgcolor: 'success.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🥗
            </Box>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ m: 0, fontSize: 16, fontWeight: 800 }} noWrap>
                {item.name}
              </Typography>
              <Typography variant="body2" sx={{ m: 0, fontSize: 13, color: 'text.secondary' }}>
                {item.benefits}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  )
}

export default FoodAlternativeList
