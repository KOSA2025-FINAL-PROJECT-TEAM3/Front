import { Alert, AlertTitle, Box, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import AppDialog from './AppDialog'

const DEFAULT_MESSAGE =
  'AI 기능은 정확하지 않습니다. 약은 약사와, 병 증세 진단은 의사와 상담하셔야 합니다.'

export const AiWarningDialog = ({
  isOpen,
  onClose,
  contextMessage,
  footer,
}) => {
  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="AI 생성 정보 주의"
      description="AI 검색 결과는 참고용으로만 활용해주세요."
      maxWidth="sm"
      footer={footer}
    >
      <Alert severity="warning" variant="outlined">
        <AlertTitle>AI 생성 내용은 부정확할 수 있습니다.</AlertTitle>
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          <Typography variant="body2">{DEFAULT_MESSAGE}</Typography>
          {contextMessage && (
            <Typography variant="body2" color="text.secondary">
              {contextMessage}
            </Typography>
          )}
        </Box>
      </Alert>
    </AppDialog>
  )
}

AiWarningDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contextMessage: PropTypes.string,
  footer: PropTypes.node,
}

export default AiWarningDialog

