import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import logger from '@core/utils/logger'
import { searchApiClient } from '@core/services/api/searchApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { useEffect, useMemo, useState } from 'react'

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export const MedicationModal = ({
  intakeTimes = [],
  onAdd,
  onClose,
  initialMedication = null,
  mode = 'add',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedMedication, setSelectedMedication] = useState(initialMedication)
  const [medicationDetails, setMedicationDetails] = useState({
    dosageAmount: 1,
    intakeTimeIndices: intakeTimes.map((_, i) => i),
    daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
    notes: '',
  })
  const [searching, setSearching] = useState(false)

  const selectedTimeIndices = useMemo(
    () => medicationDetails.intakeTimeIndices || [],
    [medicationDetails.intakeTimeIndices],
  )
  const selectedDays = useMemo(
    () => (medicationDetails.daysOfWeek ? medicationDetails.daysOfWeek.split(',').filter(Boolean) : []),
    [medicationDetails.daysOfWeek],
  )

  useEffect(() => {
    if (!initialMedication) return

    setSelectedMedication(initialMedication)
    setMedicationDetails({
      dosageAmount: initialMedication.dosageAmount || 1,
      intakeTimeIndices: initialMedication.intakeTimeIndices || intakeTimes.map((_, i) => i),
      daysOfWeek: initialMedication.daysOfWeek || 'MON,TUE,WED,THU,FRI,SAT,SUN',
      notes: initialMedication.notes || '',
    })
  }, [initialMedication, intakeTimes])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('약 이름을 입력해주세요')
      return
    }

    setSearching(true)
    try {
      const results = await searchApiClient.searchDrugs(searchQuery)
      const safeResults = Array.isArray(results) ? results : []
      setSearchResults(safeResults)
      if (safeResults.length === 0) toast.info('검색 결과가 없습니다')
    } catch (error) {
      logger.error('약 검색 실패:', error)
      toast.error('약 검색에 실패했습니다')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('약 이름을 입력해주세요')
      return
    }

    setSearching(true)
    try {
      const result = await searchApiClient.searchDrugsWithAI(searchQuery)
      setSearchResults(result ? [result] : [])
      if (result) toast.success('AI 검색 완료!')
      else toast.info('검색 결과가 없습니다')
    } catch (error) {
      logger.error('AI 검색 실패:', error)
      toast.error('AI 검색에 실패했습니다')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSelectMedication = (medication) => {
    setSelectedMedication(medication)
    setMedicationDetails({
      dosageAmount: 1,
      intakeTimeIndices: intakeTimes.map((_, i) => i),
      daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
      notes: '',
    })
  }

  const handleSubmit = () => {
    if (!selectedMedication) {
      toast.error('약을 선택해주세요')
      return
    }

    const medicationData = {
      ...selectedMedication,
      name: selectedMedication.itemName || selectedMedication.name,
      category: selectedMedication.entpName || selectedMedication.category || selectedMedication.ingredient,
      dosageAmount: medicationDetails.dosageAmount,
      intakeTimeIndices: medicationDetails.intakeTimeIndices,
      daysOfWeek: medicationDetails.daysOfWeek,
      notes: medicationDetails.notes,
      imageUrl: selectedMedication.itemImage || selectedMedication.imageUrl || null,
      totalIntakes: 30,
    }

    onAdd(medicationData)
  }

  return (
    <Dialog
      open
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          onClose?.()
        }
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {mode === 'edit' ? '약 정보 수정' : '약 검색'}
          </Typography>
          <IconButton aria-label="닫기" onClick={() => onClose?.()}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {mode === 'add' ? (
          <Box sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="약 이름 검색..."
                fullWidth
                size="small"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={searching}
                sx={{ fontWeight: 900, minWidth: 90 }}
              >
                {searching ? '검색중...' : '검색'}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAISearch}
                disabled={searching}
                sx={{ fontWeight: 900, minWidth: 100 }}
              >
                {searching ? 'AI검색중...' : 'AI 검색'}
              </Button>
            </Stack>

            <List dense sx={{ border: 1, borderColor: 'divider', borderRadius: 2, maxHeight: 260, overflowY: 'auto' }}>
              {searchResults.map((med, index) => {
                const selected =
                  selectedMedication?.itemSeq && med.itemSeq ? selectedMedication.itemSeq === med.itemSeq : selectedMedication === med

                return (
                  <ListItemButton key={`${med.itemSeq || index}`} selected={selected} onClick={() => handleSelectMedication(med)}>
                    <ListItemText
                      primaryTypographyProps={{ sx: { fontWeight: 900 } }}
                      primary={med.itemName || med.name}
                      secondary={med.entpName || med.category || med.ingredient || '제조사 정보 없음'}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Box>
        ) : null}

        {selectedMedication ? (
          <Box sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1.5 }}>
              {selectedMedication.itemName || selectedMedication.name} 복용 정보
            </Typography>

            <Stack spacing={2}>
              <TextField
                type="number"
                label="1회 복용량 (정)"
                value={medicationDetails.dosageAmount}
                inputProps={{ min: 1 }}
                onChange={(e) =>
                  setMedicationDetails((prev) => ({
                    ...prev,
                    dosageAmount: parseInt(e.target.value, 10) || 1,
                  }))
                }
                size="small"
              />

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                  복용 시간
                </Typography>
                {intakeTimes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    처방전의 복용 시간을 먼저 설정해주세요
                  </Typography>
                ) : (
                  <ToggleButtonGroup
                    value={selectedTimeIndices}
                    onChange={(_, next) => {
                      const indices = Array.isArray(next) ? next : []
                      setMedicationDetails((prev) => ({ ...prev, intakeTimeIndices: indices }))
                    }}
                    size="small"
                    sx={{ mt: 1, flexWrap: 'wrap' }}
                  >
                    {intakeTimes.map((time, index) => (
                      <ToggleButton key={index} value={index} sx={{ fontWeight: 900 }}>
                        {time}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                  복용 요일
                </Typography>
                <ToggleButtonGroup
                  value={selectedDays}
                  onChange={(_, next) => {
                    const days = Array.isArray(next) ? next : []
                    const ordered = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
                    setMedicationDetails((prev) => ({ ...prev, daysOfWeek: ordered.join(',') }))
                  }}
                  size="small"
                  sx={{ mt: 1, flexWrap: 'wrap' }}
                >
                  {DAY_ORDER.map((day) => (
                    <ToggleButton key={day} value={day} sx={{ fontWeight: 900 }}>
                      {day}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <TextField
                label="메모"
                value={medicationDetails.notes}
                onChange={(e) => setMedicationDetails((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="복용 시 주의사항 등"
                size="small"
                multiline
                minRows={3}
              />
            </Stack>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {mode === 'add' ? '검색 결과에서 약을 선택하세요.' : '수정할 약 정보가 없습니다.'}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" onClick={() => onClose?.()} sx={{ fontWeight: 900 }}>
          닫기
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!selectedMedication} sx={{ fontWeight: 900 }}>
          {mode === 'edit' ? '수정 완료' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MedicationModal
