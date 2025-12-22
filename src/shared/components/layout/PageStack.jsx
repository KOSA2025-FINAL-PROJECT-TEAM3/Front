import { Stack } from '@mui/material'
import PropTypes from 'prop-types'

export const PageStack = ({ spacing = { xs: 3, md: 4 }, sx = {}, children, ...props }) => {
  return (
    <Stack spacing={spacing} sx={sx} {...props}>
      {children}
    </Stack>
  )
}

PageStack.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.array,
    PropTypes.object,
  ]),
  sx: PropTypes.object,
}

export default PageStack

