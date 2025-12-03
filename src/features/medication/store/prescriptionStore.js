import { create } from 'zustand';
import { prescriptionApiClient } from '@core/services/api/prescriptionApiClient';

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

    // 처방전 생성
    createPrescription: async (prescriptionData) => {
        set({ loading: true, error: null });
        try {
            console.log('Creating prescription with data:', prescriptionData);
            const newPrescription = await prescriptionApiClient.createPrescription(prescriptionData);
            console.log('Prescription created successfully:', newPrescription);
            set(state => ({
                prescriptions: [newPrescription, ...state.prescriptions],
                loading: false
            }));
            return newPrescription;
        } catch (error) {
            console.error('Prescription creation error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // 처방전 수정
    updatePrescription: async (id, prescriptionData) => {
        set({ loading: true, error: null });
        try {
            const updated = await prescriptionApiClient.updatePrescription(id, prescriptionData);
            set(state => ({
                prescriptions: state.prescriptions.map(p => p.id === id ? updated : p),
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

    // 상태 초기화
    resetState: () => {
        set({
            currentPrescription: null,
            error: null,
            loading: false
        });
    }
}));
