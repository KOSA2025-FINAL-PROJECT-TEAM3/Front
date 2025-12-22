import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material'

import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import logger from '@core/utils/logger'

const STATUS_LABEL = {
  ACTIVE: '치료 중',
  CURED: '완치',
  CHRONIC: '만성',
}

const formatDate = (value) => {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return String(value)
  }
}

export const FamilyDiseasesTab = ({ userId }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      if (!userId) return
      setLoading(true)
      setError('')
      try {
        const data = await diseaseApiClient.listByUser(userId)
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        logger.error('[FamilyDiseasesTab] Failed to fetch diseases', err)
        setItems([])
        setError('질병 정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    void fetch()
  }, [userId])

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        질병 정보를 불러오는 중...
      </Typography>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          등록된 질병이 없습니다.
        </Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={1.5}>
      {items.map((disease) => (
        <Paper key={disease.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                  {disease.name}
                </Typography>
                {disease.status ? (
                  <Chip
                    size="small"
                    label={STATUS_LABEL[disease.status] ?? disease.status}
                    sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100', fontWeight: 900 }}
                  />
                ) : null}
                {disease.isCritical ? (
                  <Chip
                    size="small"
                    label="중요"
                    sx={{ bgcolor: 'error.100', border: '1px solid', borderColor: 'error.200', fontWeight: 900 }}
                  />
                ) : null}
                {disease.isPrivate ? (
                  <Chip size="small" label="비공개" sx={{ bgcolor: 'grey.200', border: '1px solid', borderColor: 'grey.300' }} />
                ) : null}
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  lineHeight: 1.5,
                  minHeight: '3em', // 2줄 높이 고정 (1.5 * 2)
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {disease.description || '\u00A0'}
              </Typography>
            </Box>

            <Stack spacing={0.5} sx={{ flexShrink: 0, alignItems: 'flex-end' }}>
              {formatDate(disease.diagnosedAt) ? (
                <Typography variant="caption" color="text.secondary">
                  진단일: {disease.isDiagnosedDateUnknown ? '날짜 모름' : formatDate(disease.diagnosedAt)}
                </Typography>
              ) : null}
              <Typography variant="caption" color="text.disabled">
                업데이트: {formatDate(disease.updatedAt || disease.createdAt) || '-'}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

FamilyDiseasesTab.propTypes = {
  userId: PropTypes.number.isRequired,
}

export default FamilyDiseasesTab

