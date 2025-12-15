/**
 * QuickActionGrid Component
 * - 빠른 실행 버튼 그리드
 * - 반응형: Mobile 2열 / Tablet 3열 / Desktop 4열
 */

import {
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import PropTypes from 'prop-types'

export const QuickActionGrid = ({ actions = [] }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  const columns = isMobile ? 2 : isTablet ? 3 : 4

  const handleClick = (action) => {
    if (action.onClick) {
      action.onClick()
    } else if (action.path) {
      window.location.href = action.path
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
      }}
    >
      {actions.map((action, index) => (
        <Button
          key={action.id || action.label || index}
          onClick={() => handleClick(action)}
          sx={{
            height: 'auto',
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'primary.light',
              borderColor: 'primary.main',
              '& .MuiTypography-root': {
                color: 'white',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
            },
          }}
        >
          <Stack spacing={1} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: 'primary.light',
                color: 'white',
              }}
            >
              {action.icon}
            </Box>
            <Typography
              variant="body2"
              fontWeight={500}
              color="text.primary"
              sx={{ textAlign: 'center' }}
            >
              {action.label}
            </Typography>
          </Stack>
        </Button>
      ))}
    </Box>
  )
}

QuickActionGrid.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ),
}

export default QuickActionGrid
