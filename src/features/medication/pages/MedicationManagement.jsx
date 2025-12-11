import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { ROUTE_PATHS } from '@config/routes.config';
import styles from './MedicationManagement.module.scss';
import { Box, FormGroup, FormControlLabel, Switch, Button } from '@mui/material';
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
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1>약 관리</h1>
              <p>처방전별로 약을 관리하세요.</p>
            </div>
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddClick}
              aria-label="약 등록"
            >
              <span className={styles.addIcon}>+</span>
              <span className={styles.addLabel}>약 등록</span>
            </button>
          </div>
        </header>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', px: 2 }}>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} size="small" />}
              label="중단된 처방전 포함"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px', color: '#666' } }}
            />
          </FormGroup>
        </Box>

        <div className={styles.prescriptionList}>
          {loading && <div className={styles.loading}>로딩 중...</div>}

          {!loading && filteredPrescriptions.length === 0 && (
            <div className={styles.emptyState}>
              <p>표시할 처방전이 없습니다.</p>
              {prescriptions.length === 0 && (
                <button onClick={handleAddClick}>첫 약 등록하기</button>
              )}
            </div>
          )}

          {filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className={styles.prescriptionCard}
              onClick={() => handlePrescriptionClick(prescription.id)}
            >
              <div className={styles.cardHeader}>
                <h3>{prescription.pharmacyName || '약국명 미입력'}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`status ${prescription.active ? 'active' : 'inactive'}`}>
                    {prescription.active ? '복용 중' : '복용 완료'}
                  </span>
                  <Button
                    size="small"
                    variant="outlined"
                    color={prescription.active ? "error" : "primary"}
                    sx={{
                      minWidth: 'auto',
                      height: '24px',
                      fontSize: '11px',
                      padding: '0 8px',
                      borderColor: prescription.active ? '#ffcccc' : '#cce5ff',
                      color: prescription.active ? '#d32f2f' : '#1976d2',
                      '&:hover': {
                        bgcolor: prescription.active ? '#ffebee' : '#e3f2fd'
                      }
                    }}
                    onClick={(e) => handleToggleActive(e, prescription)}
                  >
                    {prescription.active ? "중단" : "재개"}
                  </Button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.hospital}>{prescription.hospitalName || '병원명 미입력'}</p>
                <p className={styles.period}>
                  {prescription.startDate} ~ {prescription.endDate}
                </p>
                <div className={styles.medicationCount}>
                  포함된 약: {prescription.medicationCount}개
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default MedicationManagement;
