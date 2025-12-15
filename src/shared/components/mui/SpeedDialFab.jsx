import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const SpeedDialFab = ({
  actions = [],
  ariaLabel = '빠른 작업',
  sx,
  ...props
}) => {
  const navigate = useNavigate()
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
        bottom: 16,
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
  sx: PropTypes.object,
}

export default SpeedDialFab

