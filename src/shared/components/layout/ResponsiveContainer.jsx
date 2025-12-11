/**
 * ResponsiveContainer Component
 * - 디바이스별 padding과 width를 자동 조절하는 컨테이너
 * - Mobile: 전체 너비 (padding 작게)
 * - Tablet: 중간 너비 (padding 중간)
 * - Desktop: 최대 너비 제한 (padding 크게)
 */

import { Container } from '@mui/material'
import PropTypes from 'prop-types'

export const ResponsiveContainer = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  sx = {},
  ...props
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        px: {
          xs: 2,  // Mobile: 16px
          sm: 3,  // Tablet: 24px
          md: 4,  // Desktop: 32px
        },
        py: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  )
}

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  disableGutters: PropTypes.bool,
  sx: PropTypes.object,
}

export default ResponsiveContainer
