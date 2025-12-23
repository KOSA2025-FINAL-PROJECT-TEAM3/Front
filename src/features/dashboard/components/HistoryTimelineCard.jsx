import { useEffect, useMemo, useState, memo } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase, Paper, Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const formatDateLabel = (date) =>
  date?.toLocaleDateString?.('ko-KR', { month: 'long', day: 'numeric' }) || ''

const formatDayLabel = (date) =>
  date?.toLocaleDateString?.('ko-KR', { weekday: 'long' }) || ''

export const HistoryTimelineCard = memo(({
  title = '이전 기록',
  emptyText = '표시할 기록이 없습니다.',
  historyData = [],
  onOpenDetail,
}) => {
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [expandedKey, setExpandedKey] = useState(null)

  useEffect(() => {
    if (!Array.isArray(historyData) || historyData.length === 0) {
      setExpandedKey(null)
      return
    }

    setExpandedKey((prev) => {
      const stillExists = prev && historyData.some((g) => g.key === prev)
      if (stillExists) return prev
      const preferred = historyData.find((g) => g.key === todayKey)?.key || historyData[0].key
      return preferred || null
    })
  }, [historyData, todayKey])

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
        {onOpenDetail ? (
          <ButtonBase onClick={onOpenDetail} sx={{ borderRadius: 2, px: 1, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>
              전체 보기
            </Typography>
          </ButtonBase>
        ) : null}
      </Stack>

      {historyData.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        </Paper>
      ) : (
        historyData.map((group) => (
          <Accordion
            key={group.key}
            disableGutters
            elevation={0}
            expanded={expandedKey === group.key}
            onChange={() => setExpandedKey((prev) => (prev === group.key ? null : group.key))}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'common.white',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, color: 'text.primary' }} noWrap>
                  {group.dateLabel || formatDateLabel(group.date)}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.disabled' }} noWrap>
                  {group.dayLabel || formatDayLabel(group.date)}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0.5 }}>
              <Box sx={{ position: 'relative', pl: 2 }}>
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    bgcolor: '#F1F5F9',
                  }}
                />

                <Stack spacing={2}>
                  {(group.items || []).map((item, index) => (
                    <Box key={`${group.key}-${index}`} sx={{ position: 'relative', pl: 4 }}>
                      <Box
                        aria-hidden
                        sx={{
                          position: 'absolute',
                          left: 2,
                          top: 6,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          bgcolor: '#CBD5E1',
                          border: '3px solid #fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                          zIndex: 1,
                        }}
                      />

                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.25 }}>
                            <Typography sx={{ fontWeight: 900, fontSize: 13, color: 'text.secondary' }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{item.time}</Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            {Array.isArray(item.pillDetails) ? (
                              <Stack spacing={0.5}>
                                {item.pillDetails.map((pill, pIdx) => (
                                  <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      sx={{
                                        fontWeight: 700,
                                        color: pill.completed ? 'text.primary' : 'text.disabled'
                                      }}
                                    >
                                      {pill.name}
                                    </Typography>
                                    {pill.completed ? (
                                      <CheckIcon sx={{ fontSize: 14, color: '#34D399' }} />
                                    ) : (
                                      <Typography component="span" sx={{ fontSize: 10, color: 'text.disabled', fontWeight: 900 }}>
                                        (대기)
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              item.names
                            )}
                          </Typography>
                        </Box>

                        {!Array.isArray(item.pillDetails) && item.completed ? (
                          <Box sx={{ color: '#34D399', pt: 0.5 }}>
                            <CheckIcon fontSize="small" />
                          </Box>
                        ) : null}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Stack>
  )
})

export default HistoryTimelineCard
