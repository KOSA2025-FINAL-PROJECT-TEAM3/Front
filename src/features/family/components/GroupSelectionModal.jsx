/**
 * GroupSelectionModal
 * - 여러 가족 그룹 중 하나를 선택하는 모달
 * - Dashboard, FamilyManagement 진입 시 표시
 */

import { useState } from 'react'
import AppDialog from '@shared/components/mui/AppDialog'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useFamilyStore } from '../store/familyStore'

export const GroupSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const familyGroups = useFamilyStore((state) => state.familyGroups)
  const selectedGroupId = useFamilyStore((state) => state.selectedGroupId)
  const selectGroup = useFamilyStore((state) => state.selectGroup)
  const [localSelectedId, setLocalSelectedId] = useState(selectedGroupId)

  const handleSelect = () => {
    if (localSelectedId) {
      selectGroup(localSelectedId)
      onSelect?.(localSelectedId)
      onClose()
    }
  }

  const handleGroupClick = (groupId) => {
    setLocalSelectedId(groupId)
  }

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="가족 그룹 선택"
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        },
      }}
      footer={
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="contained" onClick={handleSelect} disabled={!localSelectedId} sx={{ fontWeight: 900 }}>
            선택
          </Button>
        </Stack>
      }
    >
      <Box sx={{ py: 1.5, minHeight: 200 }}>
        {familyGroups.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            가족 그룹이 없습니다.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {familyGroups.map((group, index) => {
              const selected = localSelectedId === group.id
              return (
                <Paper
                  key={group.id}
                  component="button"
                  type="button"
                  variant="outlined"
                  onClick={() => handleGroupClick(group.id)}
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderWidth: 2,
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? 'primary.50' : 'common.white',
                    boxShadow: selected ? '0 2px 8px rgba(74, 144, 226, 0.2)' : 'none',
                    '&:hover': { borderColor: 'primary.main', bgcolor: selected ? 'primary.50' : 'grey.50' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      #{index + 1}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      {group.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: 14, flexWrap: 'wrap' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      구성원 {group.members?.length || 0}명
                    </Box>
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      생성일: {new Date(group.createdAt).toLocaleDateString()}
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        )}
      </Box>
    </AppDialog>
  )
}

export default GroupSelectionModal
