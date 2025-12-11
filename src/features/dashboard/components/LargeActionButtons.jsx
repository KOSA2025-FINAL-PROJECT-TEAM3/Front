/**
 * LargeActionButtons Component
 * - 어르신용 큰 버튼 (약품 검색, 식단 로그)
 */

import { Button, Stack } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import PropTypes from 'prop-types'

export const LargeActionButtons = () => {
  const navigate = useNavigate()

  const buttons = [
    {
      label: '약품 검색',
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      path: ROUTE_PATHS.search,
      color: 'primary',
    },
    {
      label: '식단 로그',
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      path: ROUTE_PATHS.dietLog,
      color: 'secondary',
    },
  ]

  return (
    <Stack direction="row" spacing={2}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant="contained"
          color={button.color}
          onClick={() => navigate(button.path)}
          sx={{
            flex: 1,
            py: 4,
            borderRadius: 3,
            fontSize: '1.25rem',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
          startIcon={button.icon}
        >
          {button.label}
        </Button>
      ))}
    </Stack>
  )
}

export default LargeActionButtons
