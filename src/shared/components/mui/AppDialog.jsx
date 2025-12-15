import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material'
import PropTypes from 'prop-types'

export const AppDialog = ({
  open,
  isOpen,
  title,
  description,
  onClose,
  children,
  footer,
  maxWidth = 'sm',
  fullWidth = true,
  ...props
}) => {
  const resolvedOpen = Boolean(open ?? isOpen)

  return (
    <Dialog
      open={resolvedOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...props}
    >
      {(title || onClose) && (
        <DialogTitle sx={{ pr: onClose ? 6 : 3 }}>
          {title}
          {onClose && (
            <IconButton
              aria-label="닫기"
              onClick={onClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent dividers>
        {description && (
          <DialogContentText sx={{ mb: 2 }}>
            {description}
          </DialogContentText>
        )}
        {children}
      </DialogContent>

      {footer && <Box sx={{ p: 2 }}>{footer}</Box>}
    </Dialog>
  )
}

AppDialog.propTypes = {
  open: PropTypes.bool,
  isOpen: PropTypes.bool,
  title: PropTypes.node,
  description: PropTypes.node,
  onClose: PropTypes.func,
  children: PropTypes.node,
  footer: PropTypes.node,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  fullWidth: PropTypes.bool,
}

export default AppDialog

