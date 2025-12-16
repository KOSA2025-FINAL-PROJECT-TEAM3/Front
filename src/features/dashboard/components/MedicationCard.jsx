/**
 * MedicationCard Component
 * - 복용 카드 컴포넌트
 */

import { Box, Button, Checkbox, Chip, Paper, Stack, Typography } from '@mui/material'

/**
 * 복용 카드 컴포넌트
 * @param {Object} schedule - 복용 일정
 * @param {number} schedule.id - 카드 ID
 * @param {number} schedule.medicationId - 약 ID
 * @param {string} schedule.time - 복용 시간
 * @param {string} schedule.timeLabel - 시간 라벨(아침, 점심, 저녁 등)
 * @param {Array} schedule.medications - 약 목록
 * @param {string} schedule.status - 상태 (completed, pending, scheduled)
 * @param {string} schedule.statusLabel - 상태 라벨
 * @param {boolean} schedule.isActive - 활성 여부
 * @param {Function} onTakeMedication - 복용 처리 함수
 * @param {Function} onCardClick - 카드 클릭 함수 (약 상세/수정)
 * @returns {JSX.Element} 복용 카드
 */
export const MedicationCard = ({ schedule, onTakeMedication, onCardClick }) => {
  const getStatusColor = () => {
    switch (schedule.status) {
      case 'completed':
        return 'success.main'
      case 'pending':
        return 'warning.main'
      case 'scheduled':
        return 'grey.400'
      default:
        return 'text.disabled'
    }
  }

  const statusColor = getStatusColor()
  const isClickable = Boolean(onCardClick && schedule.medicationId)

  const handleTakeMedication = (e) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    if (onTakeMedication && schedule.status === 'pending' && schedule.isCompletable) {
      onTakeMedication(schedule)
    }
  }

  const handleCheckboxClick = (e) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    if (schedule.status === 'pending' && schedule.isCompletable) {
      handleTakeMedication(e)
    }
  }

  const handleCardClick = () => {
    if (onCardClick && schedule.medicationId) {
      onCardClick(schedule.medicationId)
    }
  }

  return (
    <Paper
      variant="outlined"
      onClick={isClickable ? handleCardClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isClickable) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      sx={{
        display: 'flex',
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        borderLeft: '4px solid',
        borderLeftColor: statusColor,
        cursor: isClickable ? 'pointer' : 'default',
        bgcolor: schedule.isActive ? 'grey.50' : 'common.white',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease',
        '&:hover': isClickable ? { boxShadow: 2, transform: 'translateY(-1px)' } : undefined,
      }}
    >
      {/* 좌측: 체크박스 */}
      <Box sx={{ pt: 0.25 }}>
        <Checkbox
          checked={schedule.status === 'completed'}
          onChange={handleCheckboxClick}
          disabled={schedule.status !== 'pending' || !schedule.isCompletable}
          inputProps={{ 'aria-label': '복용 완료' }}
        />
      </Box>

      {/* 중앙: 정보 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 0.75 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }} noWrap>
            {schedule.time}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {schedule.timeLabel}
          </Typography>
        </Stack>

        <Stack spacing={0.25}>
          {schedule.medications.map((med, idx) => (
            <Stack key={idx} direction="row" spacing={1} sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {med.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {med.dose}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* 우측: 상태 버튼 */}
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {schedule.status === 'pending' ? (
          <Button
            variant="outlined"
            size="small"
            onClick={handleTakeMedication}
            disabled={!schedule.isCompletable}
            sx={{
              borderColor: statusColor,
              color: statusColor,
              fontWeight: 800,
              '&:hover': { borderColor: statusColor },
            }}
          >
            {schedule.statusLabel || '복용'}
          </Button>
        ) : (
          <Chip
            label={schedule.statusLabel || schedule.status}
            size="small"
            variant="outlined"
            sx={{ borderColor: statusColor, color: statusColor, fontWeight: 800 }}
          />
        )}
      </Box>
    </Paper>
  )
}

export default MedicationCard
