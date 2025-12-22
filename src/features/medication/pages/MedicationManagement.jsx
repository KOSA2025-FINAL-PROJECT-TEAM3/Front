import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { PageHeader } from '@shared/components/layout/PageHeader';
import { PageStack } from '@shared/components/layout/PageStack';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { useMedicationStore } from '../store/medicationStore';
import { ROUTE_PATHS } from '@config/routes.config';
import { BackButton } from '@shared/components/mui/BackButton';
import MedicationDetailModal from '../components/MedicationDetailModal';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { toast } from '@shared/components/toast/toastStore';
import logger from '@core/utils/logger';

export const MedicationManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prescriptions, fetchPrescriptions, toggleActivePrescription, loading: prescriptionLoading } = usePrescriptionStore();
  const {
    medications,
    fetchMedications,
    updateMedication,
    removeMedication,
    toggleStatus,
    loading: medicationLoading,
  } = useMedicationStore();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  useEffect(() => {
    const rawId = location.state?.selectedMedicationId;
    const parsedId = rawId != null ? Number(rawId) : null;
    if (parsedId != null && Number.isFinite(parsedId)) {
      setSelectedMedicationId(parsedId);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (selectedMedicationId == null) return;
    if (medications.length === 0) {
      fetchMedications();
    }
  }, [selectedMedicationId, medications.length, fetchMedications]);

  const selectedMedication = useMemo(() => {
    if (selectedMedicationId == null) return null;
    return medications.find((med) => Number(med.id) === Number(selectedMedicationId)) || null;
  }, [medications, selectedMedicationId]);

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
      logger.error('Failed to toggle active status:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleMedicationClose = () => {
    setSelectedMedicationId(null);
  };

  const handleMedicationToggle = async (medicationId) => {
    try {
      await toggleStatus(medicationId);
      toast.success('복용 상태를 변경했습니다.');
    } catch (error) {
      logger.error('Failed to toggle medication status:', error);
      toast.error('복용 상태 변경에 실패했습니다.');
    }
  };

  const handleMedicationRemove = async (medicationId) => {
    if (!window.confirm('정말 이 약을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await removeMedication(medicationId);
      toast.success('약을 삭제했습니다.');
      handleMedicationClose();
    } catch (error) {
      logger.error('Failed to remove medication:', error);
      toast.error('약 삭제에 실패했습니다.');
    }
  };

  const handleMedicationUpdate = async (medicationId, values) => {
    try {
      await updateMedication(medicationId, values);
      toast.success('약 정보를 저장했습니다.');
    } catch (error) {
      logger.error('Failed to update medication:', error);
      toast.error('약 정보 저장에 실패했습니다.');
    }
  };

  const activePrescriptions = prescriptions.filter((p) => p.active);
  const inactivePrescriptions = prescriptions.filter((p) => !p.active);

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title="약 관리"
          subtitle={`복용 중 ${activePrescriptions.length}개 · 중단 ${inactivePrescriptions.length}개`}
          right={
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ md: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(ROUTE_PATHS.medicationToday)}
                sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
              >
                오늘 복약
              </Button>
              <Button
                type="button"
                variant="contained"
                onClick={handleAddClick}
                aria-label="약 등록"
                sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
              >
                + 약 등록
              </Button>
            </Stack>
          }
        />

        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                목록 필터
              </Typography>
              <Typography variant="body2" color="text.secondary">
                중단된 처방전까지 함께 보려면 토글을 켜세요.
              </Typography>
            </Box>
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} size="small" />}
              label="중단 포함"
              sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: 14, color: 'text.secondary', fontWeight: 800 } }}
            />
          </Stack>
        </Paper>

        <Stack spacing={2}>
          {prescriptionLoading && (
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  로딩 중...
                </Typography>
              </Stack>
            </Paper>
          )}

          {!prescriptionLoading && activePrescriptions.length === 0 && !showInactive && (
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderStyle: 'dashed', borderRadius: 3 }}>
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

          {!prescriptionLoading ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                  복용 중
                </Typography>
                {activePrescriptions.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderStyle: 'dashed' }}>
                    <Typography variant="body2" color="text.secondary">
                      복용 중인 처방전이 없습니다.
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={1.5}>
                    {activePrescriptions.map((prescription) => (
                      <Paper
                        key={prescription.id}
                        variant="outlined"
                        onClick={() => handlePrescriptionClick(prescription.id)}
                        sx={{
                          p: 2.25,
                          cursor: 'pointer',
                          borderRadius: 3,
                          bgcolor: 'common.white',
                          '&:hover': { boxShadow: 2, borderColor: 'primary.light' },
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                                  {prescription.pharmacyName || '약국명 미입력'}
                                </Typography>
                                <IconButton size="small" aria-label="상세 보기" sx={{ ml: 'auto' }}>
                                  <ChevronRightIcon />
                                </IconButton>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {prescription.hospitalName || '병원명 미입력'}
                              </Typography>
                            </Stack>
                            <Chip size="small" color="primary" label="복용 중" />
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            {prescription.startDate} ~ {prescription.endDate}
                          </Typography>

                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                            <Chip size="small" variant="outlined" label={`포함된 약: ${prescription.medicationCount}개`} />
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={(e) => handleToggleActive(e, prescription)}
                              sx={{ fontWeight: 900 }}
                            >
                              중단
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              {showInactive ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    중단됨
                  </Typography>
                  {inactivePrescriptions.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderStyle: 'dashed' }}>
                      <Typography variant="body2" color="text.secondary">
                        중단된 처방전이 없습니다.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={1.5}>
                      {inactivePrescriptions.map((prescription) => (
                        <Paper
                          key={prescription.id}
                          variant="outlined"
                          onClick={() => handlePrescriptionClick(prescription.id)}
                          sx={{
                            p: 2.25,
                            cursor: 'pointer',
                            borderRadius: 3,
                            bgcolor: 'common.white',
                            opacity: 0.92,
                            '&:hover': { boxShadow: 1, borderColor: 'divider', opacity: 1 },
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                                    {prescription.pharmacyName || '약국명 미입력'}
                                  </Typography>
                                  <IconButton size="small" aria-label="상세 보기" sx={{ ml: 'auto' }}>
                                    <ChevronRightIcon />
                                  </IconButton>
                                </Stack>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {prescription.hospitalName || '병원명 미입력'}
                                </Typography>
                              </Stack>
                              <Chip size="small" variant="outlined" label="중단" />
                            </Stack>

                            <Typography variant="caption" color="text.secondary">
                              {prescription.startDate} ~ {prescription.endDate}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                              <Chip size="small" variant="outlined" label={`포함된 약: ${prescription.medicationCount}개`} />
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={(e) => handleToggleActive(e, prescription)}
                                sx={{ fontWeight: 900 }}
                              >
                                재개
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </Stack>

        <MedicationDetailModal
          medication={selectedMedication}
          loading={medicationLoading}
          onClose={handleMedicationClose}
          onToggle={handleMedicationToggle}
          onRemove={handleMedicationRemove}
          onSubmit={handleMedicationUpdate}
        />
      </PageStack>
    </MainLayout>
  );
};

export default MedicationManagement;
