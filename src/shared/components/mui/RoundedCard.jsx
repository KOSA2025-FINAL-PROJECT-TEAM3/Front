/**
 * RoundedCard Component
 * - MUI Card를 확장하여 둥근 모서리와 강화된 그림자 적용
 * - 반응형 padding 지원
 */

import { Card, CardContent } from '@mui/material'
import PropTypes from 'prop-types'

export const RoundedCard = ({
  children,
  elevation = 2,
  sx = {},
  padding = 'default',
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0
      case 'small':
        return { xs: 2, sm: 2, md: 2 }
      case 'large':
        return { xs: 3, sm: 4, md: 5 }
      case 'default':
      default:
        return { xs: 2, sm: 3, md: 3 }
    }
  }

  return (
    <Card
      elevation={elevation}
      sx={{
        borderRadius: { xs: 3, sm: 4 }, // 12px → 16px
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {padding !== 'none' ? (
        <CardContent
          sx={{
            p: getPadding(),
            '&:last-child': {
              pb: getPadding(),
            },
          }}
        >
          {children}
        </CardContent>
      ) : (
        children
      )}
    </Card>
  )
}

RoundedCard.propTypes = {
  children: PropTypes.node.isRequired,
  elevation: PropTypes.number,
  sx: PropTypes.object,
  padding: PropTypes.oneOf(['none', 'small', 'default', 'large']),
}

export default RoundedCard

