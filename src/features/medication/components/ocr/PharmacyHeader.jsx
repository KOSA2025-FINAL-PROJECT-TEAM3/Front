import React from 'react'
import { Box, Paper, Stack, TextField, Typography } from '@mui/material'

/**
 * 약국명 헤더 컴포넌트 (이미지 1의 상단 부분)
 *
 * @param {Object} props
 * @param {string} props.pharmacyName - 약국명
 * @param {(name: string) => void} props.onNameChange - 약국명 변경 핸들러
 * @param {boolean} [props.editable=true] - 편집 가능 여부
 */
const PharmacyHeader = ({ pharmacyName, onNameChange, editable = true }) => {
  return (
    <Paper
      sx={{
        px: 2.5,
        py: 2,
        bgcolor: 'common.white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        mb: 1.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          약 이름표
        </Typography>
        <Box sx={{ flex: 1, maxWidth: 320, ml: 'auto' }}>
          {editable ? (
            <TextField
              size="small"
              value={pharmacyName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="약국명을 입력하세요"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Box component="span" aria-hidden sx={{ ml: 1, fontSize: 18 }}>
                    ✏️
                  </Box>
                ),
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {pharmacyName || '-'}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

export default PharmacyHeader
