import { useEffect, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
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
  onBack,
  children,
  footer,
  PaperProps: paperProps,
  maxWidth = 'sm',
  fullWidth = true,
  ...props
}) => {
  const resolvedOpen = Boolean(open ?? isOpen)
  const handleBack = onBack || onClose
  const paperRef = useRef(null)

  useEffect(() => {
    if (!resolvedOpen) return
    if (typeof document === 'undefined') return
    const active = document.activeElement
    if (active && active instanceof HTMLElement) {
      active.blur()
    }
    requestAnimationFrame(() => {
      paperRef.current?.focus()
    })
  }, [resolvedOpen])

  const mergedPaperProps = {
    tabIndex: -1,
    ...paperProps,
    ref: paperRef,
  }

  return (
    <Dialog
      open={resolvedOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={mergedPaperProps}
      {...props}
    >
      {(title || onClose) && (
        <DialogTitle sx={{ px: 1.25, py: 1.25 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center' }}>
            {handleBack ? (
              <IconButton aria-label="뒤로" onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
            ) : (
              <Box sx={{ width: 48 }} />
            )}

            <Box sx={{ textAlign: 'center', fontWeight: 900, px: 1 }}>{title}</Box>

            {onClose ? (
              <IconButton aria-label="닫기" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            ) : (
              <Box sx={{ width: 48 }} />
            )}
          </Box>
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
  onBack: PropTypes.func,
  children: PropTypes.node,
  footer: PropTypes.node,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  fullWidth: PropTypes.bool,
}

export default AppDialog
