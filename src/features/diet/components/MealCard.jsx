import { useState } from 'react'
import { MEAL_TYPE_LABELS } from '@config/constants'
import { Card, CardContent, Typography, Box, Chip, IconButton, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'

// Fallback icons
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export const MealCard = ({ meal, onEdit, onDelete, readOnly = false }) => {
  const [expandedAccordion, setExpandedAccordion] = useState(null)

  const formattedDate = new Date(meal.recordedAt || meal.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Overall level에 따른 색상 및 라벨
  // Backend: GOOD("좋음"), WARNING("주의"), DANGER("경고")
  const getLevelConfig = (level) => {
    // Backend와 동기화: "경고" = DANGER 레벨
    const normalizedLevel =
      level === '좋음' ? 'GOOD' :
        level === '주의' ? 'WARNING' :
          level === '경고' ? 'DANGER' :  // Backend enum의 displayName
            level

    switch (normalizedLevel) {
      case 'GOOD':
        return { color: 'success', label: '안전' }
      case 'WARNING':
        return { color: 'warning', label: '주의' }
      case 'DANGER':
        return { color: 'error', label: '경고' }
      default:
        return { color: 'default', label: '분석 중' }
    }
  }

  const levelConfig = getLevelConfig(meal.overallLevel)

  // Parse JSON strings if needed
  const parseSafeJson = (jsonString) => {
    if (!jsonString) return []
    if (typeof jsonString === 'string') {
      try {
        return JSON.parse(jsonString)
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        return []
      }
    }
    return Array.isArray(jsonString) ? jsonString : []
  }

  const drugInteractions = parseSafeJson(meal.drugInteractions)
  const diseaseInteractions = parseSafeJson(meal.diseaseInteractions)

  const hasDrugInteractions = drugInteractions && drugInteractions.length > 0
  const hasDiseaseInteractions = diseaseInteractions && diseaseInteractions.length > 0

  // Backend 레벨과 동기화: GOOD('좋음'), WARNING('주의'), DANGER('경고')
  const isWarningLevel = meal.overallLevel === '주의' || meal.overallLevel === '경고'
  const isDanger = meal.overallLevel === '경고'
  const cardSx = {
    mb: 2,
    borderRadius: 3,
    '&:hover': { boxShadow: 3 },
    transition: 'box-shadow 0.2s',
    ...(isWarningLevel && {
      border: '2px solid',
      borderColor: isDanger ? 'error.main' : 'warning.main',
      backgroundColor: isDanger ? 'error.50' : 'warning.50',
    }),
  }

  return (
    <Card elevation={isWarningLevel ? 2 : 1} sx={cardSx}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5} flexWrap="wrap">
              {/* 식사 종류 */}
              <Chip
                label={MEAL_TYPE_LABELS[meal.mealType]}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 'bold', borderRadius: 1 }}
              />
              {/* 상호작용 레벨 */}
              {meal.overallLevel && (
                <Chip
                  label={levelConfig.label}
                  size="small"
                  color={levelConfig.color}
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: 1,
                    ...(isWarningLevel && {
                      boxShadow: isDanger ? '0 0 8px rgba(244, 67, 54, 0.5)' : '0 0 8px rgba(251, 188, 4, 0.5)',
                    }),
                  }}
                />
              )}
              {/* 날짜 */}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {formattedDate}
              </Typography>
            </Stack>
            <Typography variant="h6" component="div" fontWeight="bold" mb={0.5}>
              {meal.foodName}
            </Typography>
            {meal.summary && (
              <Typography variant="body2" color="text.secondary" sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {meal.summary}
              </Typography>
            )}
          </Box>

          {/* 읽기 전용 모드에서는 버튼 숨김 */}
          {!readOnly && (
            <Stack direction="row" spacing={1} ml={2}>
              <IconButton onClick={() => onEdit(meal)} size="small" sx={{ color: 'primary.main', bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(meal.id)} size="small" sx={{ color: 'error.main', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          )}
        </Box>

        {/* Analysis Results Accordion Section */}
        {(hasDrugInteractions || hasDiseaseInteractions) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
            {/* 약물 상호작용 Accordion */}
            {hasDrugInteractions && (
              <Accordion
                expanded={expandedAccordion === 'drug'}
                onChange={() => setExpandedAccordion(expandedAccordion === 'drug' ? null : 'drug')}
                sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'grey.200', borderRadius: 1, mb: 1 }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDownIcon />}
                  sx={{
                    backgroundColor: 'grey.50',
                    '&:hover': { backgroundColor: 'grey.100' },
                    py: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    약물 상호작용 ({drugInteractions.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1, pb: 1 }}>
                  <Stack spacing={1}>
                    {drugInteractions.map((drug, idx) => (
                      <Box key={idx} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, borderLeft: '3px solid', borderColor: isDanger ? 'error.main' : 'warning.main' }}>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                          {drug.medicationName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {drug.description}
                        </Typography>
                        {drug.recommendation && (
                          <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                            💡 권장: {drug.recommendation}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* 질병 관련 주의사항 Accordion */}
            {hasDiseaseInteractions && (
              <Accordion
                expanded={expandedAccordion === 'disease'}
                onChange={() => setExpandedAccordion(expandedAccordion === 'disease' ? null : 'disease')}
                sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDownIcon />}
                  sx={{
                    backgroundColor: 'grey.50',
                    '&:hover': { backgroundColor: 'grey.100' },
                    py: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    질병 관련 주의사항 ({diseaseInteractions.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1, pb: 1 }}>
                  <Stack spacing={1}>
                    {diseaseInteractions.map((disease, idx) => (
                      <Box key={idx} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, borderLeft: '3px solid', borderColor: isDanger ? 'error.main' : 'warning.main' }}>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                          {disease.diseaseName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {disease.description}
                        </Typography>
                        {disease.recommendation && (
                          <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                            💡 권장: {disease.recommendation}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default MealCard
