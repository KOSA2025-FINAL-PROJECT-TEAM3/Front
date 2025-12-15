import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

export const BackButton = ({ onClick, label = '뒤로가기', ...props }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    navigate(-1)
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      startIcon={<ArrowBackIcon />}
      variant="text"
      color="inherit"
      {...props}
    >
      {label}
    </Button>
  )
}

BackButton.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string,
}

export default BackButton

