/**
 * FamilyMemberCard Component
 * - 가족 구성원의 복약 현황 카드
 */

import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material'

/**
 * @param {Object} member
 * @param {string|number} member.id
 * @param {string} member.name
 * @param {string} member.relation
 * @param {number} member.age
 * @param {{scheduled:number,completed:number,missed:number}} member.todayStatus
 * @param {string} member.lastMedicationTime
 * @param {string} member.nextMedicationTime
 * @param {(id:string|number)=>void} onDetail
 */
export const FamilyMemberCard = ({ member, onDetail }) => {
  if (!member) return null
  const { scheduled = 0, completed = 0, missed = 0 } = member.todayStatus || {}
  const complianceRate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0

  const complianceBg =
    complianceRate === 100 ? 'success.main' : complianceRate >= 50 ? 'warning.main' : 'error.main'

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', transform: 'translateY(-2px)' },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            {member.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            {member.relation ? (
              <Box
                sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  bgcolor: 'rgba(200, 200, 200, 0.12)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                }}
              >
                {member.relation}
              </Box>
            ) : null}
            {member.age != null ? (
              <Typography variant="caption" color="text.secondary">
                {member.age}세
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            minWidth: 70,
            height: 70,
            borderRadius: 2,
            bgcolor: complianceBg,
            color: 'common.white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Typography sx={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>
            {complianceRate}%
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 11, mt: 0.25 }}>
            준수율
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-around"
        sx={{ py: 1.5, mb: 2, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Stack alignItems="center" spacing={0.25} sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: 'primary.main' }}>{scheduled}</Typography>
          <Typography variant="caption" sx={{ fontSize: 11, color: 'text.disabled' }}>
            예정
          </Typography>
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack alignItems="center" spacing={0.25} sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: 'success.main' }}>{completed}</Typography>
          <Typography variant="caption" sx={{ fontSize: 11, color: 'text.disabled' }}>
            완료
          </Typography>
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack alignItems="center" spacing={0.25} sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: 'error.main' }}>{missed}</Typography>
          <Typography variant="caption" sx={{ fontSize: 11, color: 'text.disabled' }}>
            미복용
          </Typography>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 0.5 }}>
            마지막 복용
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.25 }}>
            {member.lastMedicationTime}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 0.5 }}>
            다음 복용
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.25 }}>
            {member.nextMedicationTime}
          </Typography>
        </Box>
      </Stack>

      <Button variant="outlined" fullWidth onClick={() => onDetail?.(member.id)} sx={{ fontWeight: 800 }}>
        상세 보기
      </Button>
    </Paper>
  )
}

export default FamilyMemberCard

