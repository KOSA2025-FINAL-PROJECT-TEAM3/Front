/**
 * HeroMedicationCard Component
 * - 대시보드 상단의 주요 복약 알림 카드
 * - Indigo 배경 + 둥근 모서리 + 복약 시간 강조
 */

import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material'
import { RoundedCard } from '@shared/components/ui/RoundedCard'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import PropTypes from 'prop-types'

export const HeroMedicationCard = ({
  title = '복약 시간입니다 💊',
  subtitle = '정확한 약품 정보를 확인하세요.',
  time,
  medications = [],
  onConfirm,
}) => {
  const theme = useTheme()

  return (
    <RoundedCard
      elevation={3}
      padding="large"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
        }}
      />
      
      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          {subtitle}
        </Typography>

        {time && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon />
            <Typography variant="h6" fontWeight={600}>
              {time}
            </Typography>
          </Stack>
        )}

        {medications.length > 0 && (
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3,
              p: 2,
              color: 'text.primary',
            }}
          >
            <Stack spacing={1.5}>
              {medications.map((med, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={1}>
                  <LocalPharmacyIcon color="primary" fontSize="small" />
                  <Typography variant="body1" fontWeight={500}>
                    {med.name}
                  </Typography>
                  {med.dosage && (
                    <Typography variant="body2" color="text.secondary">
                      • {med.dosage}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {onConfirm && (
          <Button
            variant="contained"
            size="large"
            onClick={onConfirm}
            sx={{
              mt: 2,
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            ✓ 복용 완료하기
          </Button>
        )}
      </Stack>
    </RoundedCard>
  )
}

HeroMedicationCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  time: PropTypes.string,
  medications: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      dosage: PropTypes.string,
    })
  ),
  onConfirm: PropTypes.func,
}

export default HeroMedicationCard
