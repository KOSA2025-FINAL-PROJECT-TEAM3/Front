import { useMemo, useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import DiseaseCard from './DiseaseCard'

const FILTERS = [
  { key: 'ALL', label: '전체' },
  { key: 'ACTIVE', label: '치료중' },
  { key: 'CURED', label: '완치' },
  { key: 'CRITICAL', label: '중요' },
]

const toTime = (value) => {
  if (!value) return 0
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

export const DiseaseList = ({ diseases = [], loading, onSelect, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return (diseases || [])
      .filter((item) => {
        const matchesQuery = !query || (item?.name || '').toLowerCase().includes(query)
        const matchesFilter =
          statusFilter === 'ALL' ||
          (statusFilter === 'CRITICAL' ? item?.isCritical : item?.status === statusFilter)
        return matchesQuery && matchesFilter
      })
      .sort((a, b) => {
        if (a?.isCritical !== b?.isCritical) return a?.isCritical ? -1 : 1
        const dateDiff = toTime(b?.diagnosedAt) - toTime(a?.diagnosedAt)
        if (dateDiff !== 0) return dateDiff
        return (Number(b?.id) || 0) - (Number(a?.id) || 0)
      })
  }, [diseases, searchTerm, statusFilter])

  const isFiltered = Boolean(searchTerm.trim() || statusFilter !== 'ALL')
  const emptyMessage = isFiltered ? '검색 결과가 없습니다.' : '등록된 질병이 없습니다.'

  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={{ bgcolor: 'grey.50', borderRadius: 3, p: 1.5 }}>
        <Stack spacing={1.25}>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="질병 검색"
            size="small"
            fullWidth
            inputProps={{ 'aria-label': '질병 검색' }}
          />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {FILTERS.map((filter) => {
              const selected = statusFilter === filter.key
              return (
                <Button
                  key={filter.key}
                  type="button"
                  variant={selected ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter(filter.key)}
                  sx={{ borderRadius: 999, fontWeight: 800 }}
                >
                  {filter.label}
                </Button>
              )
            })}
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          질병 목록을 불러오는 중입니다...
        </Typography>
      ) : filtered.length ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 1.5,
          }}
        >
          {filtered.map((disease) => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              onSelect={onSelect}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            borderStyle: 'dashed',
            textAlign: 'center',
            bgcolor: 'grey.50',
            color: 'text.secondary',
          }}
        >
          {emptyMessage}
        </Paper>
      )}
    </Stack>
  )
}

export default DiseaseList
