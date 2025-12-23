import { useState, memo } from 'react'
import PropTypes from 'prop-types'
import { Avatar, Box, Button, IconButton, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { USER_ROLES } from '@config/constants'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'

const roleLabels = {
  [USER_ROLES.SENIOR]: '어르신(부모)',
  [USER_ROLES.CAREGIVER]: '보호자(자녀)',
}



export const FamilyMemberCard = memo(({
  member,
  onDetail,
  onRemove,
  onRoleChange,
  onSettings,
  isOnline,
  isRemoving,
  isRoleChanging,
  currentUserId,
  groupOwnerId,
  canManageNotifications,
}) => {
  const [roleAnchorEl, setRoleAnchorEl] = useState(null)

  if (!member) return null
  const initials = member.name?.[0] ?? 'U'
  const joinedDate = new Date(member.joinedAt).toLocaleDateString('ko-KR')

  const isCardSelf = member.userId?.toString?.() === currentUserId?.toString?.()
  const isCardGroupOwner =
    groupOwnerId != null && member.userId?.toString?.() === groupOwnerId?.toString?.()
  const isViewerGroupOwner =
    currentUserId != null &&
    groupOwnerId != null &&
    currentUserId?.toString?.() === groupOwnerId?.toString?.()
  const canOpenSettings = onSettings && !isCardSelf && canManageNotifications

  // 역할 변경 권한: 그룹 소유자 또는 본인
  const canChangeRole = isViewerGroupOwner || isCardSelf

  // 제거 권한
  const showRemove =
    (isViewerGroupOwner && !isCardSelf) || (isCardSelf && !isCardGroupOwner)

  const removeLabel = isCardSelf ? '탈퇴' : '추방'
  const currentRole = normalizeCustomerRole(member.role)
  const oppositeRole = currentRole === USER_ROLES.SENIOR ? USER_ROLES.CAREGIVER : USER_ROLES.SENIOR

  const handleRoleToggle = () => {
    if (!canChangeRole || isRoleChanging) return
    setRoleAnchorEl(null)
    onRoleChange?.(member.id, oppositeRole)
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'common.white',
        borderRadius: 3.5,
        p: 2,
        borderColor: 'divider',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      <Box
        role={onDetail ? 'button' : undefined}
        tabIndex={onDetail ? 0 : undefined}
        onClick={() => onDetail?.(member.id)}
        onKeyDown={(e) => {
          if (!onDetail) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onDetail(member.id)
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          minWidth: 0,
          cursor: onDetail ? 'pointer' : 'default',
        }}
      >
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: member.avatarColor || '#c7d2fe',
              color: 'text.primary',
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            {initials}
          </Avatar>
          {isOnline ? (
            <Box
              aria-label="온라인"
              sx={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'common.white',
                bgcolor: 'success.main',
                boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.25)',
              }}
            />
          ) : null}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
              {member.name}
            </Typography>

            {canChangeRole && onRoleChange ? (
              <>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  endIcon={<ExpandMoreIcon sx={{ fontSize: { xs: 14, md: 18 } }} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setRoleAnchorEl(e.currentTarget)
                  }}
                  disabled={isRoleChanging}
                  title="역할 변경"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 900,
                    fontSize: { xs: 10, md: 14 },
                    px: { xs: 1, md: 1.5 },
                    py: { xs: 0.25, md: 0.5 },
                    minWidth: { xs: 'auto', md: 100 },
                    maxWidth: { xs: 90, md: 'none' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {isRoleChanging ? '변경 중...' : roleLabels[currentRole] || currentRole}
                </Button>
                <Menu
                  anchorEl={roleAnchorEl}
                  open={Boolean(roleAnchorEl)}
                  onClose={(e) => {
                    e?.stopPropagation?.()
                    setRoleAnchorEl(null)
                  }}
                >
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleToggle()
                    }}
                  >
                    {roleLabels[oppositeRole]}(으)로 변경
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button type="button" size="small" variant="outlined" disabled sx={{ borderRadius: 999, fontWeight: 900 }}>
                {roleLabels[currentRole] || currentRole}
              </Button>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            가입일: {joinedDate}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {member.email}
          </Typography>
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={{ xs: 0.5, md: 1 }}
        alignItems="center"
        sx={{ flexShrink: 0, position: 'relative', zIndex: 1 }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation()
            onDetail?.(member.id)
          }}
          sx={{
            fontWeight: 900,
            minWidth: { xs: 'auto', md: 60 },
            fontSize: { xs: 11, md: 14 },
            px: { xs: 1, md: 2 },
            py: { xs: 0.5, md: 0.75 }
          }}
        >
          상세
        </Button>

        {canOpenSettings ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onSettings?.(member.userId)
            }}
            title="알림 설정"
            aria-label="알림 설정"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: { xs: 0.5, md: 0.75 }
            }}
          >
            <SettingsIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
          </IconButton>
        ) : null}

        {showRemove ? (
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.(member.id)
            }}
            disabled={isRemoving}
            aria-busy={isRemoving}
            sx={{
              fontWeight: 900,
              minWidth: { xs: 'auto', md: 60 },
              fontSize: { xs: 11, md: 14 },
              px: { xs: 1, md: 2 },
              py: { xs: 0.5, md: 0.75 }
            }}
          >
            {isRemoving ? `${removeLabel} 중...` : removeLabel}
          </Button>
        ) : null}
      </Stack>
    </Paper>
  )
})

FamilyMemberCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(Object.values(USER_ROLES)).isRequired,
    joinedAt: PropTypes.string.isRequired,
    avatarColor: PropTypes.string,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onDetail: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func,
  onSettings: PropTypes.func,
  isOnline: PropTypes.bool,
  isRemoving: PropTypes.bool,
  isRoleChanging: PropTypes.bool,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  groupOwnerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  canManageNotifications: PropTypes.bool,
}

FamilyMemberCard.defaultProps = {
  onRoleChange: null,
  onSettings: null,
  isOnline: false,
  isRemoving: false,
  isRoleChanging: false,
  currentUserId: null,
  groupOwnerId: null,
  canManageNotifications: false,
}

export default FamilyMemberCard
