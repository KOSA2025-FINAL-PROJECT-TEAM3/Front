/**
 * AdaptiveNavigation Component
 * - Mobile: BottomNavigation (하단 고정 바)
 * - Desktop: Sidebar (왼쪽 사이드바)
 */

import { useState } from 'react'
import {
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

	export const AdaptiveNavigation = ({ items, position = 'bottom' }) => {
	  const theme = useTheme()
	  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
	  const navigate = useNavigate()
	  const location = useLocation()
	  const [value, setValue] = useState(location.pathname)
	  const useBottomNavigation = position === 'bottom' && isMobile

  const handleChange = (event, newValue) => {
    setValue(newValue)
    navigate(newValue)
  }

  const handleNavigate = (path) => {
    setValue(path)
    navigate(path)
  }

	// Mobile: BottomNavigation (position='bottom'일 때만)
	if (useBottomNavigation) {
    return (
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        ))}
      </BottomNavigation>
    )
  }

  // Desktop: Sidebar
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {items.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={value === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: value === item.path ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: value === item.path ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

AdaptiveNavigation.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    })
  ).isRequired,
  position: PropTypes.oneOf(['bottom', 'side']),
}

export default AdaptiveNavigation
