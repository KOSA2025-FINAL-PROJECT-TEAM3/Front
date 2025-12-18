import { Box, Stack, Typography } from '@mui/material'
import PropTypes from 'prop-types'

export const PageHeader = ({ title, subtitle, right, leading, sx = {} }) => {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'flex-start' }}
      justifyContent="space-between"
      sx={sx}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          {leading ? <Box sx={{ flex: '0 0 auto' }}>{leading}</Box> : null}
          <Typography
            variant="h4"
            component="h1"
            fontWeight={800}
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }, letterSpacing: -0.5, minWidth: 0 }}
          >
            {title}
          </Typography>
        </Stack>
        {subtitle ? (
          <Box>
            {typeof subtitle === 'string' ? (
              <Typography variant="body2" color="text.secondary" fontWeight={700}>
                {subtitle}
              </Typography>
            ) : (
              subtitle
            )}
          </Box>
        ) : null}
      </Box>
      {right ? <Box sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>{right}</Box> : null}
    </Stack>
  )
}

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  right: PropTypes.node,
  leading: PropTypes.node,
  sx: PropTypes.object,
}

export default PageHeader
