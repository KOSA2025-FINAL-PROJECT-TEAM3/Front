import { create } from 'zustand';
import { prescriptionApiClient } from '@core/services/api/prescriptionApiClient';
import logger from '@core/utils/logger';

export const usePrescriptionStore = create((set, get) => ({
    prescriptions: [],
    currentPrescription: null,
    loading: false,
    error: null,

    // 처방전 목록 조회
    fetchPrescriptions: async () => {
        set({ loading: true, error: null });
        try {
            const data = await prescriptionApiClient.getPrescriptions();
            set({ prescriptions: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전 상세 조회
    fetchPrescription: async (id) => {
        set({ loading: true, error: null });
        try {
            const data = await prescriptionApiClient.getPrescription(id);
            set({ currentPrescription: data, loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전 생성 (targetUserId: 보호자가 어르신 대신 등록할 때 사용)
    createPrescription: async (prescriptionData, targetUserId) => {
        set({ loading: true, error: null });
        try {
            logger.debug('Creating prescription with raw data:', prescriptionData, 'targetUserId:', targetUserId);

            const normalizedIntakeTimes = (prescriptionData.intakeTimes || []).filter(Boolean);
            if (normalizedIntakeTimes.length === 0) {
                throw new Error('복용 시간을 최소 1개 이상 등록해주세요.');
            }

            // 데이터 형식 변환
            const formattedData = {
                pharmacyName: prescriptionData.pharmacyName || '',
                hospitalName: prescriptionData.hospitalName || '',
                startDate: prescriptionData.startDate, // yyyy-MM-dd 형식
                endDate: prescriptionData.endDate,     // yyyy-MM-dd 형식
                intakeTimes: normalizedIntakeTimes.map(time => {
                    // HH:mm 형식을 HH:mm:ss 형식으로 변환
                    return time.length === 5 ? time + ':00' : time;
                }),
                paymentAmount: prescriptionData.paymentAmount || null,
                notes: prescriptionData.notes || '',
                medications: (prescriptionData.medications || []).map(med => ({
                    name: med.name,
                    category: med.category || null,
                    dosageAmount: med.dosageAmount || 1,
                    totalIntakes: med.totalIntakes || null,
                    daysOfWeek: med.daysOfWeek || null,
                    intakeTimeIndices: med.intakeTimeIndices || null,
                    notes: med.notes || '',
                    imageUrl: med.imageUrl || null
                }))
            };

            logger.debug('Creating prescription with formatted data:', formattedData);
            const newPrescription = await prescriptionApiClient.createPrescription(formattedData, targetUserId);
            logger.debug('Prescription created successfully:', newPrescription);
            set(state => ({
                prescriptions: [newPrescription, ...state.prescriptions],
                loading: false
            }));
            return newPrescription;
        } catch (error) {
            logger.error('Prescription creation error:', error);
            logger.error('Error response:', error.response?.data);
            logger.error('Error status:', error.response?.status);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전 수정
    updatePrescription: async (id, prescriptionData) => {
        set({ loading: true, error: null });
        try {
            const normalizedIntakeTimes = (prescriptionData.intakeTimes || []).filter(Boolean);
            if (normalizedIntakeTimes.length === 0) {
                throw new Error('복용 시간을 최소 1개 이상 등록해주세요.');
            }

            // 데이터 형식 변환 (createPrescription과 동일)
            const formattedData = {
                pharmacyName: prescriptionData.pharmacyName || '',
                hospitalName: prescriptionData.hospitalName || '',
                startDate: prescriptionData.startDate,
                endDate: prescriptionData.endDate,
                intakeTimes: normalizedIntakeTimes.map(time => {
                    // HH:mm 형식을 HH:mm:ss 형식으로 변환
                    return time.length === 5 ? time + ':00' : time;
                }),
                paymentAmount: prescriptionData.paymentAmount || null,
                notes: prescriptionData.notes || '',
                medications: (prescriptionData.medications || []).map(med => ({
                    name: med.name,
                    category: med.category || null,
                    dosageAmount: med.dosageAmount || 1,
                    totalIntakes: med.totalIntakes || null,
                    daysOfWeek: med.daysOfWeek || null,
                    intakeTimeIndices: med.intakeTimeIndices || null,
                    notes: med.notes || '',
                    imageUrl: med.imageUrl || null
                }))
            };

            const updated = await prescriptionApiClient.updatePrescription(id, formattedData);

            // 목록 표시용 객체로 변환 (medicationCount 추가)
            // PrescriptionDetailResponse에는 medicationCount가 없으므로 medications 배열 길이로 계산
            const listUpdate = {
                ...updated,
                medicationCount: updated.medications ? updated.medications.length : 0
            };

            set(state => ({
                prescriptions: state.prescriptions.map(p => p.id === id ? listUpdate : p),
                currentPrescription: state.currentPrescription?.id === id ? updated : state.currentPrescription,
                loading: false
            }));
            return updated;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전 삭제
    deletePrescription: async (id) => {
        set({ loading: true, error: null });
        try {
            await prescriptionApiClient.deletePrescription(id);
            set(state => ({
                prescriptions: state.prescriptions.filter(p => p.id !== id),
                currentPrescription: state.currentPrescription?.id === id ? null : state.currentPrescription,
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전에 약 추가
    addMedicationToPrescription: async (prescriptionId, medication) => {
        set({ loading: true, error: null });
        try {
            await prescriptionApiClient.addMedication(prescriptionId, medication);
            // 처방전 상세 정보 갱신
            if (get().currentPrescription?.id === prescriptionId) {
                await get().fetchPrescription(prescriptionId);
            } else {
                // 목록만 갱신 (약 개수 업데이트 등을 위해)
                await get().fetchPrescriptions();
                set({ loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전에서 약 제거
    removeMedicationFromPrescription: async (prescriptionId, medicationId) => {
        set({ loading: true, error: null });
        try {
            await prescriptionApiClient.removeMedication(prescriptionId, medicationId);
            // 처방전 상세 정보 갱신
            if (get().currentPrescription?.id === prescriptionId) {
                await get().fetchPrescription(prescriptionId);
            } else {
                // 목록만 갱신
                await get().fetchPrescriptions();
                set({ loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전 활성 상태 토글
    toggleActivePrescription: async (id) => {
        set({ loading: true, error: null });
        try {
            const updated = await prescriptionApiClient.toggleActive(id);
            set(state => ({
                prescriptions: state.prescriptions.map(p =>
                    p.id === id ? { ...p, active: updated.active } : p
                ),
                currentPrescription: state.currentPrescription?.id === id
                    ? { ...state.currentPrescription, active: updated.active }
                    : state.currentPrescription,
                loading: false
            }));
            return updated;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 상태 초기화
    resetState: () => {
        set({
            currentPrescription: null,
            error: null,
            loading: false
        });
    }
}));
