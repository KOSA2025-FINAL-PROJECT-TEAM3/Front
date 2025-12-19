import { Stack } from '@mui/material'
import AppDialog from './AppDialog'
import AppButton from './AppButton'

/**
 * 재사용 가능한 확인 다이얼로그
 * @param {boolean} open - 다이얼로그 표시 여부
 * @param {string} title - 제목
 * @param {string} description - 설명 (본문)
 * @param {function} onConfirm - 확인 버튼 클릭 핸들러
 * @param {function} onCancel - 취소 버튼 클릭 핸들러 (또는 닫기)
 * @param {string} [confirmLabel='확인'] - 확인 버튼 텍스트
 * @param {string} [cancelLabel='취소'] - 취소 버튼 텍스트
 * @param {string} [confirmVariant='primary'] - 확인 버튼 스타일 variant (primary, danger 등)
 * @param {boolean} [loading=false] - 로딩 상태 (버튼 비활성화 및 스피너)
 */
export const AppConfirmDialog = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmVariant = 'primary',
  loading = false,
}) => {
  return (
    <AppDialog
      isOpen={open}
      title={title}
      description={description}
      onClose={onCancel}
      maxWidth="xs"
      footer={
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <AppButton variant="secondary" onClick={onCancel} fullWidth disabled={loading}>
            {cancelLabel}
          </AppButton>
          <AppButton variant={confirmVariant} onClick={onConfirm} fullWidth loading={loading}>
            {confirmLabel}
          </AppButton>
        </Stack>
      }
    />
  )
}

export default AppConfirmDialog
