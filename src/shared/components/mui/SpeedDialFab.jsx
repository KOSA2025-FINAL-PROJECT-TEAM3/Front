import { SpeedDial, SpeedDialAction, SpeedDialIcon, Backdrop, Box, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery, useTheme } from '@mui/material'

/**
 * Enhanced SpeedDialFab
 * - Supports "Game-feel" (Scale bounce, Haptics)
 * - Supports Backdrop Blur
 * - Supports Senior Accessibility (Large size, Labels)
 */
export const SpeedDialFab = ({
  actions = [],
  ariaLabel = '빠른 작업',
  avoidBottomDock = true,
  gameFeel = false,
  backdropBlur = false,
  highContrast = false,
  size = 'large', // 'medium' | 'large' | number (px)
  sx,
  ...props
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // 🎮 Haptic feedback helper
  const triggerHaptic = (duration = 50) => {
    if (gameFeel && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    triggerHaptic(30)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleClick = () => {
    setOpen((prev) => !prev)
    triggerHaptic(50)
  }

  const handleActionClick = (action) => {
    triggerHaptic(40)
    if (action.onClick) {
      action.onClick()
    } else if (action.path) {
      navigate(action.path)
    }
    setOpen(false)
  }

  // Calculate position
  const bottomPosition = isMobile
    ? avoidBottomDock
      ? 'calc(var(--bottom-dock-height) + var(--safe-area-bottom) + 16px)'
      : 'calc(var(--safe-area-bottom) + 16px)'
    : 32

  // Styles based on props
  const mainFabSx = {
    bgcolor: highContrast ? '#000000' : theme.palette.primary.main,
    color: highContrast ? '#FFFFFF' : theme.palette.common.white,
    width: typeof size === 'number' ? size : size === 'large' ? 64 : 56,
    height: typeof size === 'number' ? size : size === 'large' ? 64 : 56,
    transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transform: isPressed ? 'scale(0.85)' : 'scale(1)',
    '&:hover': {
      bgcolor: highContrast ? '#333333' : theme.palette.primary.dark,
    },
  }

  return (
    <>
      {/* Optional Backdrop with Blur */}
      {backdropBlur && (
        <Backdrop
          open={open}
          sx={{
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            bgcolor: 'rgba(255, 255, 255, 0.3)',
          }}
        />
      )}

      <SpeedDial
        ariaLabel={ariaLabel}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: bottomPosition,
          right: 24,
          zIndex: 1050,
          '& .MuiFab-primary': mainFabSx,
          ...sx,
        }}
        FabProps={{
          onMouseDown: () => gameFeel && setIsPressed(true),
          onMouseUp: () => gameFeel && setIsPressed(false),
          onTouchStart: () => gameFeel && setIsPressed(true),
          onTouchEnd: () => gameFeel && setIsPressed(false),
        }}
        {...props}
      >
        {actions.map((action, index) => (
          <SpeedDialAction
            key={action.id || action.label || index}
            icon={action.icon}
            tooltipTitle={!highContrast ? action.label : null}
            tooltipOpen={highContrast || isMobile}
            onClick={() => handleActionClick(action)}
            FabProps={{
              sx: {
                bgcolor: highContrast ? '#FFFFFF' : (action.color?.bg || 'common.white'),
                color: highContrast ? '#000000' : (action.color?.fg || 'text.primary'),
                width: 50,
                height: 50,
                '&:hover': {
                  bgcolor: highContrast ? '#F0F0F0' : (action.color?.bg || 'grey.100'),
                  filter: 'brightness(0.95)',
                },
                ...action.sx,
              },
            }}
          />
        ))}
      </SpeedDial>
    </>
  )
}

SpeedDialFab.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      icon: PropTypes.node,
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  ariaLabel: PropTypes.string,
  avoidBottomDock: PropTypes.bool,
  gameFeel: PropTypes.bool,
  backdropBlur: PropTypes.bool,
  highContrast: PropTypes.bool,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sx: PropTypes.object,
}

export default SpeedDialFab
