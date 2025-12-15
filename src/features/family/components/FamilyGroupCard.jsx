import PropTypes from 'prop-types'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

export const FamilyGroupCard = ({ group, memberCount = 0 }) => {
  if (!group) return null

  const createdDate = new Date(group.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // [Fixed] ownerId is the current owner, find name from members
  const owner = group.members?.find(
    (m) =>
      String(m.id) === String(group.ownerId || group.createdBy) ||
      String(m.userId) === String(group.ownerId || group.createdBy),
  )
  const ownerName = owner?.name || group.createdBy?.name || '알 수 없음'

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        bgcolor: 'common.white',
        borderRadius: 4,
        p: 2.5,
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, m: 0 }}>
          {group.name}
        </Typography>
        <Chip
          label={`${memberCount}명 참여`}
          size="small"
          sx={{ bgcolor: 'primary.50', color: 'primary.dark', fontWeight: 900, borderRadius: 999 }}
        />
      </Stack>
      <Stack spacing={0.75} sx={{ color: 'text.secondary' }}>
        <Box component="span">소유자: {ownerName}</Box>
        <Box component="span">생성일: {createdDate}</Box>
      </Stack>
    </Paper>
  )
}

FamilyGroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    createdAt: PropTypes.string,
    createdBy: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
      }),
    ]),
    members: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  memberCount: PropTypes.number,
}

FamilyGroupCard.defaultProps = {
  memberCount: 0,
}

export default FamilyGroupCard
