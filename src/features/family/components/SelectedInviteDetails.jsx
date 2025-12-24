import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'
import useKakao from '../../../core/hooks/useKakao.js'
import envConfig from '@config/environment.config'
import { toast } from '@shared/components/toast/toastStore'

const ROLE_LABELS = {
  SENIOR: '시니어',
  CAREGIVER: '보호자',
}

const SelectedInviteDetails = ({ invite, onClose, onCancel, onRoleChange, cancelingId, updatingInviteId }) => {
  const { shareInvite } = useKakao()
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState(invite?.suggestedRole || 'SENIOR')
  const inviteId = invite?.id || invite?.shortCode || invite?.inviteCode

  const inviteLink = useMemo(() => {
    if (!invite) return ''

    // 1. 백엔드에서 제공한 URL을 최우선 사용 (서버에서 올바른 도메인으로 생성됨)
    if (invite.inviteUrl) {
      return invite.inviteUrl
    }

    // 2. 백엔드 URL이 없는 경우에만 프론트엔드에서 생성
    const origin = envConfig.FRONTEND_URL

    if (invite.longToken) {
      return `${origin}${ROUTE_PATHS.inviteLanding}?token=${invite.longToken}`
    }
    if (invite.shortCode || invite.inviteCode) {
      const code = invite.shortCode || invite.inviteCode
      return `${origin}${ROUTE_PATHS.inviteCodeEntry}?code=${code}`
    }
    return ''
  }, [invite])

  const linkAvailable = Boolean(inviteLink)

  const handleCopyLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
      .then(() => toast.success('초대 링크가 복사되었습니다.'))
      .catch(() => toast.error('복사에 실패했습니다.'))
  }

  const handleKakaoShare = () => {
    if (!inviteLink) return
    // [FIX] inviteeName(초대받는 사람), groupName(가족 그룹명) 전달
    shareInvite(inviteLink, invite.inviteeName || '가족', invite.groupName || '가족 그룹')
  }

  const handleSaveRole = () => {
    if (invite.id && selectedRole !== invite.suggestedRole) {
      onRoleChange(invite.id, selectedRole)
    }
    setIsEditingRole(false)
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
          초대 정보 확인
        </Typography>

        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            이름
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {invite.inviteeName || '이름 미지정'}
          </Typography>
        </Stack>

        {invite.intendedForEmail ? (
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              이메일
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {invite.intendedForEmail}
            </Typography>
          </Stack>
        ) : null}

        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            만료 시각
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {invite.expiresAt ? new Date(invite.expiresAt).toLocaleString('ko-KR') : '정보 없음'}
          </Typography>
        </Stack>

        <Divider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
          <TextField value={inviteLink} inputProps={{ readOnly: true }} size="small" fullWidth />
          <Button type="button" variant="contained" onClick={handleCopyLink} disabled={!linkAvailable}>
            링크 복사
          </Button>
        </Stack>

        <Button
          type="button"
          variant="contained"
          onClick={handleKakaoShare}
          disabled={!linkAvailable}
          sx={{
            bgcolor: '#FEE500',
            color: 'rgba(0,0,0,0.87)',
            '&:hover': { bgcolor: '#FDD835' },
          }}
        >
          카카오톡으로 공유하기
        </Button>

        {invite.shortCode ? (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.50' }}>
            <Stack spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                수동 입력 코드
              </Typography>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  bgcolor: 'background.paper',
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: '0.5em',
                  color: 'primary.main',
                }}
              >
                {invite.shortCode}
              </Box>
              <Typography variant="caption" color="text.secondary">
                이 코드를 초대할 분에게 공유하세요.
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            예정된 역할
          </Typography>

          {isEditingRole ? (
            <>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="invite-role-label">역할</InputLabel>
                <Select
                  labelId="invite-role-label"
                  label="역할"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="SENIOR">{ROLE_LABELS.SENIOR}</MenuItem>
                  <MenuItem value="CAREGIVER">{ROLE_LABELS.CAREGIVER}</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="button"
                variant="outlined"
                onClick={handleSaveRole}
                disabled={updatingInviteId === inviteId}
              >
                저장
              </Button>
              <Button type="button" variant="text" onClick={() => setIsEditingRole(false)}>
                취소
              </Button>
            </>
          ) : (
            <>
              <Chip
                label={ROLE_LABELS[invite.suggestedRole] || invite.suggestedRole}
                color={invite.suggestedRole === 'CAREGIVER' ? 'success' : 'primary'}
                size="small"
              />
              <Button type="button" variant="text" onClick={() => setIsEditingRole(true)}>
                역할 수정
              </Button>
            </>
          )}
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            type="button"
            color="error"
            variant="contained"
            onClick={() => onCancel(inviteId)}
            disabled={cancelingId === inviteId}
          >
            {cancelingId === inviteId ? '취소 중...' : '초대 취소'}
          </Button>
          <Button type="button" variant="outlined" onClick={onClose}>
            닫기
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

SelectedInviteDetails.propTypes = {
  invite: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired,
  cancelingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  updatingInviteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default SelectedInviteDetails
