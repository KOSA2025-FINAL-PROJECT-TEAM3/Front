import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { Alert, Box, Button, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { MEMBER_ROLE_OPTIONS } from '@/constants/uiConstants'

export const InviteMemberForm = ({ onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      suggestedRole: 'SENIOR',
    },
  })

  const handleInvite = async (formData) => {
    try {
      // API call expects { email, name, ... }. For Open Invite, email might be empty.
      await onSubmit?.({
        ...formData,
        email: formData.email || null, // Convert empty string to null if needed
      })

      // Form reset only on success
      reset({ name: '', email: '', suggestedRole: 'SENIOR' })
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err.message || '초대에 실패했습니다.',
      })
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack component="form" spacing={2} onSubmit={handleSubmit(handleInvite)}>
        {errors.root ? <Alert severity="error">{errors.root.message}</Alert> : null}

        <TextField
          label="이름 (선택)"
          placeholder="초대할 분의 이름"
          disabled={loading}
          error={Boolean(errors.name)}
          helperText={errors.name?.message || ''}
          {...register('name', {
            minLength: { value: 2, message: '이름은 최소 2글자 이상이어야 합니다.' },
          })}
          fullWidth
        />

        <Box>
          <TextField
            label="이메일 (선택 - 직접 발송용)"
            placeholder="senior@example.com"
            disabled={loading}
            error={Boolean(errors.email)}
            helperText={errors.email?.message || '이메일을 입력하면 초대장이 메일로도 발송됩니다.'}
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '유효한 이메일을 입력해주세요.',
              },
            })}
            fullWidth
          />
        </Box>

        <Controller
          name="suggestedRole"
          control={control}
          render={({ field }) => (
            <Box>
              <Typography variant="caption" color="text.secondary">
                역할
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={field.value}
                onChange={(_, nextValue) => {
                  if (!nextValue) return
                  field.onChange(nextValue)
                }}
                disabled={loading}
                sx={{ mt: 1 }}
                fullWidth
              >
                {MEMBER_ROLE_OPTIONS.map((option) => (
                  <ToggleButton key={option.value} value={option.value} sx={{ py: 1.25 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography component="span" sx={{ fontSize: 18 }}>
                        {option.icon}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {option.label}
                      </Typography>
                    </Stack>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}
        />

        <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 800, py: 1.25 }}>
          {loading ? '초대 중...' : '초대 링크 생성'}
        </Button>
      </Stack>
    </Paper>
  )
}

InviteMemberForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

InviteMemberForm.defaultProps = {
  loading: false,
}

export default InviteMemberForm
