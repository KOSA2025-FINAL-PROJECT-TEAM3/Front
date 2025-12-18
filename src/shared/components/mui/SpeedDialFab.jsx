import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery, useTheme } from '@mui/material'

export const SpeedDialFab = ({
  actions = [],
  ariaLabel = '빠른 작업',
  avoidBottomDock = true,
  sx,
  ...props
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick()
      return
    }
    if (action.path) {
      navigate(action.path)
    }
  }

  return (
    <SpeedDial
      ariaLabel={ariaLabel}
      icon={<SpeedDialIcon />}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      sx={{
        position: 'fixed',
        bottom: isMobile
          ? avoidBottomDock
            ? 'calc(var(--bottom-dock-height) + var(--safe-area-bottom) + var(--bottom-dock-gap))'
            : 'calc(var(--safe-area-bottom) + var(--bottom-dock-gap))'
          : 16,
        right: 16,
        ...sx,
      }}
      {...props}
    >
      {actions.map((action, index) => (
        <SpeedDialAction
          key={action.id || action.label || index}
          icon={action.icon}
          tooltipTitle={action.label}
          onClick={() => {
            handleActionClick(action)
            setOpen(false)
          }}
        />
      ))}
    </SpeedDial>
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
  sx: PropTypes.object,
}

export default SpeedDialFab
