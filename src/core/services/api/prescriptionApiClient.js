import { ApiClient } from './ApiClient';

class PrescriptionApiClient extends ApiClient {
    constructor() {
        super({
            basePath: '/api/prescriptions'
        });
    }

    /**
     * 처방전 생성 (단독 약 등록 또는 OCR 일괄 등록)
     * @param {Object} data - 처방전 데이터
     * @returns {Promise<Object>} 생성된 처방전 상세 정보
     */
    async createPrescription(data) {
        return this.post('', data);
    }

    /**
     * 내 처방전 목록 조회
     * @returns {Promise<Array>} 처방전 목록
     */
    async getPrescriptions() {
        return this.get('');
    }

    /**
     * 처방전 상세 조회
     * @param {number} id - 처방전 ID
     * @returns {Promise<Object>} 처방전 상세 정보 (약 목록 포함)
     */
    async getPrescription(id) {
        return this.get(`/${id}`);
    }

    /**
     * 처방전 수정
     * @param {number} id - 처방전 ID
     * @param {Object} data - 수정할 처방전 데이터
     * @returns {Promise<Object>} 수정된 처방전 상세 정보
     */
    async updatePrescription(id, data) {
        return this.put(`/${id}`, data);
    }

    /**
     * 처방전 삭제
     * @param {number} id - 처방전 ID
     * @returns {Promise<void>}
     */
    async deletePrescription(id) {
        return this.delete(`/${id}`);
    }

    /**
     * 처방전에 약 추가
     * @param {number} prescriptionId - 처방전 ID
     * @param {Object} medicationData - 추가할 약 정보
     * @returns {Promise<Object>} 추가된 약 정보
     */
    async addMedication(prescriptionId, medicationData) {
        return this.post(`/${prescriptionId}/medications`, medicationData);
    }

    /**
     * 처방전 활성 상태 토글
     * @param {number} id - 처방전 ID
     * @returns {Promise<Object>} 변경된 처방전 상세 정보
     */
    async toggleActive(id) {
        return this.patch(`/${id}/toggle-active`);
    }

    /**
     * 처방전에서 약 제거
     * @param {number} prescriptionId - 처방전 ID
     * @param {number} medicationId - 약 ID
     * @returns {Promise<void>}
     */
    async removeMedication(prescriptionId, medicationId) {
        return this.delete(`/${prescriptionId}/medications/${medicationId}`);
    }
}

export const prescriptionApiClient = new PrescriptionApiClient();
