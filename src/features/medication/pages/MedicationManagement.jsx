import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { ROUTE_PATHS } from '@config/routes.config';
import styles from './MedicationManagement.module.scss';

export const MedicationManagement = () => {
  const navigate = useNavigate();
  const { prescriptions, fetchPrescriptions, loading } = usePrescriptionStore();

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleAddClick = () => {
    navigate(ROUTE_PATHS.prescriptionAdd);
  };

  const handlePrescriptionClick = (id) => {
    navigate(ROUTE_PATHS.prescriptionDetail.replace(':id', id));
  };

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
              aria-label="처방전 등록"
            >
              <span className={styles.addIcon}>+</span>
              <span className={styles.addLabel}>처방전 등록</span>
            </button>
          </div>
        </header>

        <div className={styles.prescriptionList}>
          {loading && <div className={styles.loading}>로딩 중...</div>}

          {!loading && prescriptions.length === 0 && (
            <div className={styles.emptyState}>
              <p>등록된 처방전이 없습니다.</p>
              <button onClick={handleAddClick}>첫 처방전 등록하기</button>
            </div>
          )}

          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className={styles.prescriptionCard}
              onClick={() => handlePrescriptionClick(prescription.id)}
            >
              <div className={styles.cardHeader}>
                <h3>{prescription.pharmacyName || '약국명 미입력'}</h3>
                <span className={`status ${prescription.active ? 'active' : 'inactive'}`}>
                  {prescription.active ? '복용 중' : '복용 완료'}
                </span>
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
