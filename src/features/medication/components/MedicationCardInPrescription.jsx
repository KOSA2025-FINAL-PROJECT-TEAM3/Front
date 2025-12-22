import { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const DAY_LABEL = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
}

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export const MedicationCardInPrescription = ({ medication, intakeTimes = [], onEdit, onRemove }) => {
  const [imageError, setImageError] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const noteText = String(medication.notes || '').trim()
  const isLongNote = noteText.length > 60

  const timeLabels = useMemo(() => {
    if (Array.isArray(medication.intakeTimeIndices) && medication.intakeTimeIndices.length > 0) {
      const indices = Array.from(new Set(medication.intakeTimeIndices))
        .filter((idx) => idx >= 0 && idx < intakeTimes.length)
        .sort((a, b) => a - b)

      const times = indices
        .map((idx) => intakeTimes[idx])
        .filter(Boolean)

      if (times.length === 0) return ['시간 설정 필요']
      return times
    }

    if (Array.isArray(medication.schedules) && medication.schedules.length > 0) {
      const times = medication.schedules
        .map((schedule) => schedule?.time)
        .filter(Boolean)
      if (times.length === 0) return ['시간 설정 필요']
      return Array.from(new Set(times)).sort((a, b) => String(a).localeCompare(String(b)))
    }

    return ['전체 시간']
  }, [intakeTimes, medication.intakeTimeIndices, medication.schedules])

  const dayLabels = useMemo(() => {
    let daysOfWeek = medication.daysOfWeek
    if (!daysOfWeek && medication.schedules && medication.schedules.length > 0) {
      daysOfWeek = medication.schedules[0].daysOfWeek
    }

    if (!daysOfWeek) return ['매일']

    const days = daysOfWeek
      .split(',')
      .filter(Boolean)
      .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
    if (days.length === 7) return ['매일']

    return days.map((d) => DAY_LABEL[d] || d)
  }, [medication.daysOfWeek, medication.schedules])

  const title = medication.name
  const category = medication.category || '분류 없음'

  // 3분할 표시: 1일 frequency회, 1회 dosePerIntake정, 총 quantity개
  const frequency = medication.frequency || 1
  const dosePerIntake = medication.dosePerIntake || medication.dosageAmount || parseInt(medication.dosage, 10) || 1
  const totalQuantity = medication.quantity

  const frequencyText = `1일 ${frequency}회`
  const doseText = `1회 ${dosePerIntake}정`
  const quantityText = totalQuantity ? `총 ${totalQuantity}정` : null

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
      <CardContent sx={{ pb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar
            variant="rounded"
            src={hasImage ? medication.imageUrl : undefined}
            alt={title}
            sx={{ width: 56, height: 56, bgcolor: 'grey.100', border: 1, borderColor: 'divider', fontSize: 22 }}
            imgProps={{ onError: () => setImageError(true) }}
          >
            💊
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {category}
                </Typography>
              </Box>

              {hasActions ? (
                <Stack direction="row" spacing={0.5} sx={{ flex: '0 0 auto' }}>
                  {onEdit ? (
                    <IconButton
                      aria-label="수정"
                      onClick={() => onEdit(medication)}
                      size="small"
                      sx={{
                        width: 36,
                        height: 36,
                        minWidth: 36,
                        minHeight: 36,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                  {onRemove ? (
                    <IconButton
                      aria-label="삭제"
                      onClick={onRemove}
                      size="small"
                      color="error"
                      sx={{
                        width: 36,
                        height: 36,
                        minWidth: 36,
                        minHeight: 36,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Stack>
              ) : null}
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip size="small" label={frequencyText} sx={{ bgcolor: 'primary.50', fontWeight: 900, color: 'primary.700' }} />
              <Chip size="small" label={doseText} sx={{ bgcolor: 'grey.50', fontWeight: 900 }} />
              {quantityText && <Chip size="small" label={quantityText} sx={{ bgcolor: 'grey.50', fontWeight: 900 }} />}
              {dayLabels.length === 1 ? (
                <Chip size="small" label={dayLabels[0]} sx={{ bgcolor: 'grey.50', fontWeight: 900 }} />
              ) : (
                dayLabels.map((day) => (
                  <Chip key={day} size="small" label={day} sx={{ bgcolor: 'grey.50', fontWeight: 900 }} />
                ))
              )}
              {timeLabels.map((time) => (
                <Chip key={time} size="small" label={time} sx={{ bgcolor: 'grey.50', fontWeight: 900 }} />
              ))}
            </Stack>

            {noteText ? (
              <Box sx={{ mt: 1 }}>
                {isLongNote ? (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() => setNotesOpen((prev) => !prev)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setNotesOpen((prev) => !prev)
                        }
                      }}
                      sx={{
                        px: 1.25,
                        py: 0.9,
                        borderRadius: 2,
                        bgcolor: 'warning.50',
                        border: 1,
                        borderColor: 'warning.200',
                        cursor: 'pointer',
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'warning.900' }}>
                        메모
                      </Typography>
                      <ExpandMoreIcon
                        sx={{
                          fontSize: 18,
                          color: 'warning.900',
                          transform: notesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 160ms ease',
                        }}
                      />
                    </Stack>
                    <Collapse in={notesOpen} timeout="auto" unmountOnExit>
                      <Box
                        sx={{
                          mt: 1,
                          px: 1.25,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: 'common.white',
                          border: 1,
                          borderColor: 'warning.200',
                          color: 'text.secondary',
                          fontSize: 13,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {noteText}
                      </Box>
                    </Collapse>
                  </>
                ) : (
                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'warning.50',
                      border: 1,
                      borderColor: 'warning.200',
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'warning.900' }}>
                      메모
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.5,
                        color: 'text.secondary',
                        fontSize: 13,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.55,
                      }}
                    >
                      {noteText}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default MedicationCardInPrescription
