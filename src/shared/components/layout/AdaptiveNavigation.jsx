/**
 * AdaptiveNavigation Component
 * - Mobile: BottomNavigation (하단 고정 바)
 * - Desktop: Sidebar (왼쪽 사이드바)
 */

import { useMemo } from 'react'
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

  const activePath = useMemo(() => {
    if (!items?.length) return ''
    const pathname = location.pathname || ''

    const matched = items.find((item) => {
      if (!item?.path) return false
      return pathname === item.path || pathname.startsWith(item.path + '/')
    })

    return matched?.path || items[0].path
  }, [items, location.pathname])

  const handleChange = (event, newValue) => {
    navigate(newValue)
  }

  const handleNavigate = (path) => {
    navigate(path)
  }

  // Bottom: Mobile only (Desktop는 Header segmented nav가 기본)
  if (position === 'bottom') {
    if (!isMobile) return null
    return (
      <BottomNavigation
        value={activePath}
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

  // Side: Optional Sidebar (needs explicit position='side')
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          position: 'relative',
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {items.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={activePath === item.path}
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
                    color: activePath === item.path ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: activePath === item.path ? 600 : 400,
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
