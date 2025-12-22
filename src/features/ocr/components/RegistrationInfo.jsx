import React from 'react'
import { Alert, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material'

/**
 * 등록 정보 컴포넌트 (이미지 4 하단 참고)
 *
 * @param {Object} props
 * @param {string|null} props.hospitalName - 병원명
 * @param {string} props.pharmacyName - 약국명
 * @param {number|null} props.paymentAmount - 수납 금액
 * @param {(updates: object) => void} props.onUpdate - 업데이트 핸들러
 * @param {string} [props.createdDate] - 생성일
 */
const RegistrationInfo = ({
  hospitalName,
  pharmacyName,
  paymentAmount,
  onUpdate,
  createdDate
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return ''
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        등록 정보
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="병원 정보"
          value={hospitalName || ''}
          onChange={(e) => onUpdate({ hospitalName: e.target.value || null })}
          placeholder="입력하세요"
          fullWidth
        />

        <TextField
          label="약국명"
          value={pharmacyName}
          onChange={(e) => onUpdate({ pharmacyName: e.target.value })}
          placeholder="약국명"
          fullWidth
        />

        <TextField
          label="수납 금액"
          type="number"
          value={paymentAmount || ''}
          onChange={(e) => onUpdate({ paymentAmount: parseInt(e.target.value) || null })}
          placeholder="금액 입력"
          fullWidth
          InputProps={{
            endAdornment: paymentAmount ? (
              <InputAdornment position="end">
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 900 }}>
                  {formatCurrency(paymentAmount)}
                </Typography>
              </InputAdornment>
            ) : undefined,
            inputProps: { inputMode: 'numeric' },
          }}
        />
      </Stack>

      {createdDate ? (
        <Alert severity="info" sx={{ mt: 2, bgcolor: 'grey.50' }}>
          생성일 {createdDate}
        </Alert>
      ) : null}
    </Paper>
  )
}

export default RegistrationInfo
