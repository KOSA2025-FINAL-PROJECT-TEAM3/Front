import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { ROUTE_PATHS } from '@config/routes.config';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { toast } from '@shared/components/toast/toastStore';

export const MedicationManagement = () => {
  const navigate = useNavigate();
  const { prescriptions, fetchPrescriptions, toggleActivePrescription, loading } = usePrescriptionStore();
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleAddClick = () => {
    navigate(ROUTE_PATHS.prescriptionAdd);
  };

  const handlePrescriptionClick = (id) => {
    navigate(ROUTE_PATHS.prescriptionDetail.replace(':id', id));
  };

  const handleToggleActive = async (e, prescription) => {
    e.stopPropagation();
    const action = prescription.active ? '중단' : '재개';
    if (!window.confirm(`정말 이 처방전의 복용을 ${action}하시겠습니까?`)) {
      return;
    }

    try {
      await toggleActivePrescription(prescription.id);
      toast.success(`처방전 복용이 ${action}되었습니다.`);
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => showInactive ? true : p.active);

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2.5, py: 2.5, pb: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              약 관리
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              처방전별로 약을 관리하세요.
            </Typography>
          </Box>
          <Button
            type="button"
            variant="contained"
            onClick={handleAddClick}
            aria-label="약 등록"
            sx={{ fontWeight: 800 }}
          >
            + 약 등록
          </Button>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                size="small"
              />
            }
            label="중단된 처방전 포함"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: 14, color: 'text.secondary' } }}
          />
        </Box>

        <Stack spacing={2}>
          {loading && (
            <Paper variant="outlined" sx={{ p: 4 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  로딩 중...
                </Typography>
              </Stack>
            </Paper>
          )}

          {!loading && filteredPrescriptions.length === 0 && (
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderStyle: 'dashed' }}>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                표시할 처방전이 없습니다.
              </Typography>
              {prescriptions.length === 0 && (
                <Button sx={{ mt: 2 }} variant="contained" onClick={handleAddClick}>
                  첫 약 등록하기
                </Button>
              )}
            </Paper>
          )}

          {!loading &&
            filteredPrescriptions.map((prescription) => (
              <Paper
                key={prescription.id}
                variant="outlined"
                onClick={() => handlePrescriptionClick(prescription.id)}
                sx={{
                  p: 2.5,
                  cursor: 'pointer',
                  borderRadius: 2,
                  '&:hover': { boxShadow: 2, borderColor: 'primary.200' },
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      {prescription.pharmacyName || '약국명 미입력'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        size="small"
                        variant="outlined"
                        color={prescription.active ? 'primary' : 'default'}
                        label={prescription.active ? '복용 중' : '복용 완료'}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color={prescription.active ? 'error' : 'primary'}
                        onClick={(e) => handleToggleActive(e, prescription)}
                      >
                        {prescription.active ? '중단' : '재개'}
                      </Button>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {prescription.hospitalName || '병원명 미입력'}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {prescription.startDate} ~ {prescription.endDate}
                  </Typography>

                  <Box>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`포함된 약: ${prescription.medicationCount}개`}
                      sx={{ bgcolor: 'action.hover' }}
                    />
                  </Box>
                </Stack>
              </Paper>
            ))}
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default MedicationManagement;
