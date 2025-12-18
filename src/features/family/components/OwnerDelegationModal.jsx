import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'

/**
 * 소유자 양도 모달
 * - 그룹 소유자가 CAREGIVER → SENIOR로 역할 전환 시
 * - 새 소유자를 선택해야 함
 */
const OwnerDelegationModal = ({
  isOpen,
  onClose,
  onConfirm,
  members = [],
  currentOwnerId,
  isLoading = false,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState(null)

  // 새 소유자 후보: CAREGIVER 역할을 가진 다른 멤버들 (본인 제외)
  const eligibleMembers = useMemo(() => {
    return members.filter((m) => {
      // CAREGIVER만 소유자가 될 수 있음
      if (m.role !== 'CAREGIVER') return false
      
      // 현재 소유자 제외 (userId 또는 id로 비교)
      const memberUserId = String(m.userId || '')
      const memberId = String(m.id || '')
      const ownerIdStr = String(currentOwnerId || '')
      
      if (ownerIdStr && (memberUserId === ownerIdStr || memberId === ownerIdStr)) {
        return false
      }
      
      return true
    })
  }, [members, currentOwnerId])

  const handleConfirm = () => {
    if (selectedMemberId) {
      onConfirm(selectedMemberId)
    }
  }

  const handleClose = () => {
    setSelectedMemberId(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          px: 1.25,
          py: 1.25,
          fontWeight: 900,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'common.white',
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center' }}>
          <IconButton aria-label="뒤로" onClick={handleClose} sx={{ color: 'inherit' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ textAlign: 'center', fontWeight: 900, px: 1 }}>그룹 소유자 양도</Box>
          <IconButton aria-label="닫기" onClick={handleClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
          그룹 소유자가 어르신(SENIOR) 역할로 전환하려면
          <br />
          새로운 소유자를 지정해야 합니다.
        </Typography>

        {eligibleMembers.length === 0 ? (
          <Alert severity="warning" sx={{ mt: 2.5 }}>
            <Stack spacing={0.5}>
              <Typography sx={{ fontWeight: 900 }}>양도 가능한 보호자(CAREGIVER)가 없습니다.</Typography>
              <Typography variant="body2">다른 보호자를 그룹에 먼저 초대해주세요.</Typography>
            </Stack>
          </Alert>
        ) : (
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
              새 소유자 선택
            </Typography>
            <RadioGroup
              value={selectedMemberId ?? ''}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {eligibleMembers.map((member) => (
                <Box
                  key={member.id}
                  onClick={() => setSelectedMemberId(String(member.id))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedMemberId(String(member.id))
                    }
                  }}
                  sx={{
                    border: '2px solid',
                    borderColor: String(selectedMemberId) === String(member.id) ? 'primary.main' : 'divider',
                    borderRadius: 3,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    bgcolor: String(selectedMemberId) === String(member.id) ? 'primary.50' : 'transparent',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.50' },
                    mb: 1.25,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <FormControlLabel
                      value={String(member.id)}
                      control={<Radio />}
                      label=""
                      sx={{ m: 0 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900 }}>{member.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </RadioGroup>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined">
          취소
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedMemberId || isLoading || eligibleMembers.length === 0}
          variant="contained"
          sx={{ fontWeight: 900 }}
        >
          {isLoading ? '처리 중...' : '양도하고 역할 변경'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

OwnerDelegationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  members: PropTypes.array,
  currentOwnerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isLoading: PropTypes.bool,
}

export default OwnerDelegationModal
