import { useMemo, useState } from 'react'
import { Avatar, Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'

const DAY_LABEL = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
}

export const MedicationCardInPrescription = ({ medication, intakeTimes = [], onEdit, onRemove }) => {
  const [imageError, setImageError] = useState(false)

  const intakeTimesText = useMemo(() => {
    if (medication.intakeTimeIndices && medication.intakeTimeIndices.length > 0) {
      const times = medication.intakeTimeIndices
        .filter((idx) => idx >= 0 && idx < intakeTimes.length)
        .map((idx) => intakeTimes[idx])

      if (times.length === 0) return '시간 설정 필요'
      return times.join(', ')
    }

    if (medication.schedules && medication.schedules.length > 0) {
      const times = medication.schedules.map((schedule) => schedule.time)
      return times.join(', ')
    }

    return '모든 시간'
  }, [intakeTimes, medication.intakeTimeIndices, medication.schedules])

  const daysOfWeekText = useMemo(() => {
    let daysOfWeek = medication.daysOfWeek
    if (!daysOfWeek && medication.schedules && medication.schedules.length > 0) {
      daysOfWeek = medication.schedules[0].daysOfWeek
    }

    if (!daysOfWeek) return '매일'

    const days = daysOfWeek.split(',').filter(Boolean)
    if (days.length === 7) return '매일'

    return days.map((d) => DAY_LABEL[d] || d).join(', ')
  }, [medication.daysOfWeek, medication.schedules])

  const title = medication.name
  const category = medication.category || '분류 없음'
  const dosageText = medication.dosage || `${medication.dosageAmount}정`
  const hasActions = Boolean(onEdit || onRemove)
  const hasImage = Boolean(medication.imageUrl) && !imageError

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        mb: 1.5,
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover': { boxShadow: 2, transform: 'translateY(-1px)' },
      }}
    >
      <CardContent sx={{ pb: hasActions ? 1.5 : 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar
            variant="rounded"
            src={hasImage ? medication.imageUrl : undefined}
            alt={title}
            sx={{ width: 48, height: 48, bgcolor: 'grey.100', border: 1, borderColor: 'divider', fontSize: 22 }}
            imgProps={{ onError: () => setImageError(true) }}
          >
            💊
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {category}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip size="small" label={`복용량: ${dosageText}`} sx={{ bgcolor: 'grey.50' }} />
              <Chip size="small" label={`시간: ${intakeTimesText}`} sx={{ bgcolor: 'grey.50' }} />
              <Chip size="small" label={`요일: ${daysOfWeekText}`} sx={{ bgcolor: 'grey.50' }} />
            </Stack>

            {medication.notes ? (
              <Box
                sx={{
                  mt: 1,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: 'warning.50',
                  border: 1,
                  borderColor: 'warning.200',
                  color: 'warning.900',
                  fontSize: 13,
                }}
              >
                {medication.notes}
              </Box>
            ) : null}
          </Box>
        </Stack>
      </CardContent>

      {hasActions ? (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.75, pt: 0 }}>
          {onEdit ? (
            <Button size="small" variant="outlined" onClick={() => onEdit(medication)} sx={{ fontWeight: 900 }}>
              수정
            </Button>
          ) : null}
          {onRemove ? (
            <Button size="small" color="error" variant="outlined" onClick={onRemove} sx={{ fontWeight: 900 }}>
              삭제
            </Button>
          ) : null}
        </CardActions>
      ) : null}
    </Card>
  )
}

export default MedicationCardInPrescription
