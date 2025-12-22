import FamilyMemberCard from './FamilyMemberCard'
import { Box, Paper, Stack, Typography } from '@mui/material'

export const FamilyMemberList = ({
  members = [],
  onDetail,
  onRemove,
  onSettings,
  onRoleChange,
  onlineMemberIds = [],
  removingMemberId,
  roleChangingMemberId,
  currentUserId,
  groupOwnerId,
  canManageNotifications = false,
}) => {
  if (!members.length) {
    return (
      <Paper
        component="section"
        variant="outlined"
        aria-live="polite"
        sx={{ p: 4, borderRadius: 4, borderStyle: 'dashed', textAlign: 'center', color: 'text.secondary' }}
      >
        <Typography variant="body1" sx={{ fontWeight: 900 }}>
          아직 등록된 가족 구성원이 없습니다.
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75 }}>
          상단의 초대 버튼을 눌러 가족을 초대해보세요.
        </Typography>
      </Paper>
    )
  }

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ m: 0, fontSize: 18, fontWeight: 900 }}>
        가족 구성원
      </Typography>
      <Stack spacing={1.5}>
        {members.map((member) => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onDetail={onDetail}
            onRemove={onRemove}
            onSettings={onSettings}
            onRoleChange={onRoleChange}
            canManageNotifications={canManageNotifications}
            isOnline={onlineMemberIds.includes(member.id)}
            isRemoving={removingMemberId === member.id}
            isRoleChanging={roleChangingMemberId === member.id}
            currentUserId={currentUserId}
            groupOwnerId={groupOwnerId}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default FamilyMemberList
