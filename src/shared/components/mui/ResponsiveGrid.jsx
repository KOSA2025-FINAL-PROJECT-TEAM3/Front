/**
 * ResponsiveGrid Component
 * - MUI Grid를 래핑하여 반응형 레이아웃 간편화
 * - Mobile: 1열 / Tablet: 2열 / Desktop: 3열 (커스터마이징 가능)
 */

import { Grid } from '@mui/material'
import PropTypes from 'prop-types'

export const ResponsiveGrid = ({
  children,
  spacing = { xs: 2, sm: 3, md: 4 },
  columns = { xs: 1, sm: 2, md: 3 },
  sx = {},
  ...props
}) => {
  return (
    <Grid
      container
      spacing={spacing}
      sx={{
        ...sx,
      }}
      {...props}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <Grid
            item
            key={index}
            xs={12 / (columns.xs || 1)}
            sm={12 / (columns.sm || 2)}
            md={12 / (columns.md || 3)}
          >
            {child}
          </Grid>
        ))
      ) : (
        <Grid
          item
          xs={12 / (columns.xs || 1)}
          sm={12 / (columns.sm || 2)}
          md={12 / (columns.md || 3)}
        >
          {children}
        </Grid>
      )}
    </Grid>
  )
}

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
  }),
  sx: PropTypes.object,
}

export default ResponsiveGrid

