/**
 * StatusBadge Component
 * - 복약 상태를 표시하는 배지 컴포넌트
 * - 일관된 크기와 색상 적용
 */

import { Chip } from '@mui/material'
import PropTypes from 'prop-types'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ScheduleIcon from '@mui/icons-material/Schedule'

const STATUS_CONFIG = {
  completed: {
    label: '복용 완료',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  pending: {
    label: '복용 예정',
    color: 'warning',
    icon: <ScheduleIcon />,
  },
  missed: {
    label: '미복용',
    color: 'error',
    icon: <CancelIcon />,
  },
  skipped: {
    label: '건너뜀',
    color: 'default',
    icon: <CancelIcon />,
  },
}

export const StatusBadge = ({
  status,
  size = 'medium',
  showIcon = true,
  sx = {},
  ...props
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={showIcon ? config.icon : undefined}
      sx={{
        fontWeight: 500,
        ...sx,
      }}
      {...props}
    />
  )
}

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['completed', 'pending', 'missed', 'skipped']).isRequired,
  size: PropTypes.oneOf(['small', 'medium']),
  showIcon: PropTypes.bool,
  sx: PropTypes.object,
}

export default StatusBadge
