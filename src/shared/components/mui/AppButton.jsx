import { Button, CircularProgress } from '@mui/material'
import PropTypes from 'prop-types'

const VARIANT_MAP = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  danger: { variant: 'contained', color: 'error' },
  ghost: { variant: 'text', color: 'primary' },
}

const SIZE_MAP = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
}

export const AppButton = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  const mapped = VARIANT_MAP[variant] ?? VARIANT_MAP.primary
  const muiSize = SIZE_MAP[size] ?? SIZE_MAP.md
  const loadingIndicator = loading ? (
    <CircularProgress size={16} color="inherit" />
  ) : undefined

  return (
    <Button
      {...mapped}
      size={muiSize}
      disabled={disabled || loading}
      startIcon={loadingIndicator}
      {...props}
    >
      {children}
    </Button>
  )
}

AppButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
}

export default AppButton

