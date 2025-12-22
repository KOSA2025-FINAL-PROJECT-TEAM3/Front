import PropTypes from 'prop-types'
import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material'

const roleLabels = {
  SENIOR: '시니어',
  CAREGIVER: '보호자',
}

export const MemberProfileCard = ({ member }) => {
  if (!member) return null
  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        display: 'flex',
        gap: 2,
        p: 2.5,
        bgcolor: 'common.white',
        borderRadius: 4,
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Avatar
        sx={{
          width: 72,
          height: 72,
          borderRadius: 4,
          bgcolor: member.avatarColor || '#c4b5fd',
          fontSize: 28,
          fontWeight: 900,
        }}
      >
        {member.name?.[0] ?? '멤'}
      </Avatar>

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, m: 0 }}>
          {member.name}
        </Typography>
        <Chip
          label={roleLabels[member.role] || member.role}
          size="small"
          sx={{ mt: 0.75, bgcolor: 'secondary.50', color: 'secondary.dark', fontWeight: 900 }}
        />
        <Stack spacing={0.25} sx={{ mt: 1, color: 'text.secondary' }}>
          <Typography variant="body2">{member.email}</Typography>
          <Typography variant="body2">
            가입일: {new Date(member.joinedAt).toLocaleDateString('ko-KR')}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  )
}

MemberProfileCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['SENIOR', 'CAREGIVER']).isRequired,
    joinedAt: PropTypes.string.isRequired,
    avatarColor: PropTypes.string,
  }).isRequired,
}

export default MemberProfileCard
