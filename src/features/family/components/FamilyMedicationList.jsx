import { useState, useEffect } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, FormGroup, FormControlLabel, Switch, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './FamilyMedicationList.module.scss';
import { prescriptionApiClient } from '@core/services/api/prescriptionApiClient';
import { toast } from '@shared/components/toast/toastStore';
import logger from '@core/utils/logger';

const getTimeCategory = (timeString = null) => {
  let hour;
  if (timeString) {
    // If "HH:mm:ss" or "HH:mm"
    if (timeString.includes(':')) {
      hour = parseInt(timeString.split(':')[0], 10);
    } else {
      // Date string
      hour = new Date(timeString).getHours();
    }
  } else {
    hour = new Date().getHours();
  }

  if (hour >= 5 && hour < 11) return 'MORNING';
  if (hour >= 11 && hour < 17) return 'LUNCH';
  if (hour >= 17 && hour < 21) return 'DINNER';
  return 'NIGHT';
};

export const FamilyMedicationList = ({ medications = [], onUpdate }) => {
  const [expanded, setExpanded] = useState({});
  const [showInactive, setShowInactive] = useState(false);
  const [localMeds, setLocalMeds] = useState(medications);

  useEffect(() => {
    setLocalMeds(medications);
  }, [medications]);

  useEffect(() => {
    // Initialize expanded based on current time
    const currentCategory = getTimeCategory();
    setExpanded({ [currentCategory]: true });
  }, []);

  const handleToggleActive = async (med) => {
    if (!med.prescriptionId) {
      toast.error('처방전 정보가 없어 상태를 변경할 수 없습니다.');
      return;
    }

    const action = med.active ? '중단' : '재개';
    if (!window.confirm(`정말 이 약의 복용을 ${action}하시겠습니까? (처방전 내 모든 약이 함께 변경됩니다)`)) {
      return;
    }

    try {
      await prescriptionApiClient.toggleActive(med.prescriptionId);
      toast.success(`복용이 ${action}되었습니다.`);

      // Optimistic Update
      const updatedMeds = localMeds.map(m => {
        if (m.prescriptionId === med.prescriptionId) {
          return { ...m, active: !m.active };
        }
        return m;
      });
      setLocalMeds(updatedMeds);

      // Notify parent if callback exists (to re-fetch)
      if (onUpdate) onUpdate();
    } catch (error) {
      logger.error('Failed to toggle active status:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };


  if (!localMeds.length) {
    return (
      <section className={styles.empty}>
        <p>등록된 약이 없습니다.</p>
      </section>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  const getStatusLabel = (active) => {
    return active ? '복용 중' : '복용 종료'
  }

  const getStatusColor = (active) => {
    return active ? '#00B300' : '#999999'
  }

  const SECTION_LABELS = {
    MORNING: { label: '아침', sub: '05:00 - 11:00' },
    LUNCH: { label: '점심', sub: '11:00 - 17:00' },
    DINNER: { label: '저녁', sub: '17:00 - 21:00' },
    NIGHT: { label: '취침 전', sub: '21:00 - 05:00' },
    OTHER: { label: '기타 (스케줄 없음)', sub: '' }
  };

  const SECTION_ORDER = ['MORNING', 'LUNCH', 'DINNER', 'NIGHT', 'OTHER'];

  // Group medications by time
  const groupedMedications = localMeds
    .filter(med => showInactive ? true : med.active) // Filter based on toggle
    .reduce((acc, med) => {
      if (!med.schedules || med.schedules.length === 0) {
        if (!acc['OTHER']) acc['OTHER'] = [];
        acc['OTHER'].push({ ...med, displayTime: med.timing || '시간 미지정' });
        return acc;
      }

      med.schedules.forEach(schedule => {
        const category = getTimeCategory(schedule.time); // schedule.time is likely LocalTime string "HH:mm:ss"
        if (!acc[category]) acc[category] = [];

        acc[category].push({
          ...med,
          displayTime: schedule.time?.substring(0, 5) // HH:mm
        });
      });
      return acc;
    }, {});

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev => ({ ...prev, [panel]: isExpanded }));
  };

  return (
    <section className={styles.list}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} size="small" />}
            label="중단된 약 포함"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px', color: '#666' } }}
          />
        </FormGroup>
      </Box>

      {SECTION_ORDER.map(sectionKey => {
        const sectionMeds = groupedMedications[sectionKey];
        if (!sectionMeds || sectionMeds.length === 0) return null;

        // Sort by time within section
        if (sectionKey !== 'OTHER') {
          sectionMeds.sort((a, b) => (a.displayTime || '').localeCompare(b.displayTime || ''));
        }

        return (
          <Accordion
            key={sectionKey}
            expanded={!!expanded[sectionKey]}
            onChange={handleAccordionChange(sectionKey)}
            disableGutters
            elevation={0}
            sx={{
              mb: 2,
              border: '1px solid #e0e0e0',
              borderRadius: '8px !important',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: '#fff', borderRadius: '8px' }}
            >
              <Box display="flex" alignItems="baseline">
                <Typography variant="h6" fontWeight="bold" mr={1} fontSize="16px">
                  {SECTION_LABELS[sectionKey].label}
                </Typography>
                {SECTION_LABELS[sectionKey].sub && (
                  <Typography variant="caption" color="text.secondary">
                    {SECTION_LABELS[sectionKey].sub}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
              <div className={styles.medListContainer}>
                {sectionMeds.map((med, idx) => (
                  <div key={`${sectionKey}-${med.id}-${idx}`} className={styles.card}>
                    <div className={styles.medInfo}>
                      <h4>{med.name}</h4>
                      <div className={styles.detailsRow}>
                        <span className={styles.timeBadge}>{med.displayTime}</span>
                        {med.ingredient && <span className={styles.ingredient}>{med.ingredient}</span>}
                        {med.dosage && <span className={styles.dosage}>{med.dosage}</span>}
                      </div>
                      {(med.startDate || med.endDate) && (
                        <p className={styles.period}>
                          {formatDate(med.startDate)} ~ {formatDate(med.endDate)}
                        </p>
                      )}
                    </div>
                    <div className={styles.statusSection}>
                      <span
                        className={styles.status}
                        style={{ color: getStatusColor(med.active) }}
                      >
                        {getStatusLabel(med.active)}
                      </span>
                      {/* Control Button */}
                      {med.prescriptionId && (
                        <Button
                          size="small"
                          variant="outlined"
                          color={med.active ? "error" : "primary"}
                          sx={{
                            minWidth: 'auto',
                            height: '24px',
                            fontSize: '11px',
                            padding: '0 8px',
                            ml: 1,
                            borderColor: med.active ? '#ffcccc' : '#cce5ff',
                            color: med.active ? '#d32f2f' : '#1976d2',
                            '&:hover': {
                              bgcolor: med.active ? '#ffebee' : '#e3f2fd'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(med);
                          }}
                        >
                          {med.active ? "중단" : "재개"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </section>
  )
}

export default FamilyMedicationList
