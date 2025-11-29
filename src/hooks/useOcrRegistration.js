import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApiClient } from '@/core/services/api/medicationApiClient';

/**
 * OCR 기반 약물 등록 훅
 * OCR 결과를 바탕으로 약물을 일괄 등록합니다.
 * 
 * @returns {Object} { registerMedications, loading, error, result }
 */
export const useOcrRegistration = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    /**
     * OCR 결과에서 timing 추출 헬퍼 함수
     * 
     * @param {string} frequency - 복용 빈도 (예: "하루 3회", "아침/저녁")
     * @returns {string} timing - "아침", "점심", "저녁", "취침"
     */
    const extractTiming = (frequency) => {
        if (!frequency) return '아침';

        const freq = frequency.toLowerCase();
        if (freq.includes('아침')) return '아침';
        if (freq.includes('점심')) return '점심';
        if (freq.includes('저녁')) return '저녁';
        if (freq.includes('취침')) return '취침';

        return '아침'; // Default
    };

    /**
     * 약물 일괄 등록 실행
     * 
     * @param {OCRResponse} ocrResponse - OCR 스캔 결과
     * @param {Object} options - 추가 옵션
     * @param {boolean} options.navigateOnSuccess - 성공 시 약물 목록 페이지로 이동 (기본: true)
     * @returns {Promise<MedicationBatchRegistrationResponse>} 등록 결과
     */
    const registerMedications = async (ocrResponse, options = {}) => {
        const { navigateOnSuccess = true } = options;

        try {
            setLoading(true);
            setError(null);

            // Transform OCRResponse to RegisterFromOCRRequest
            const request = {
                medications: ocrResponse.medications.map(med => ({
                    name: med.name,
                    dosage: med.dosage || '1정',
                    frequency: med.frequency || '하루 3회',
                    duration: med.duration || '7일',
                    timing: extractTiming(med.frequency),
                    imageUrl: med.imageUrl, // From MFDS API
                })),
            };

            // Call backend API
            const response = await medicationApiClient.registerFromOCR(request);

            // Backend returns MedicationBatchRegistrationResponse
            const batchResult = response.data || response;

            setResult(batchResult);

            // Handle partial success
            if (batchResult.successCount > 0) {
                let message = `${batchResult.successCount}개 약물이 등록되었습니다.`;

                if (batchResult.failureCount > 0) {
                    message += `\n\n등록 실패: ${batchResult.failureNames.join(', ')}`;
                    message += '\n(약물명이 정확하지 않거나 데이터베이스에 없을 수 있습니다)';
                }

                // Show success message
                alert(message);

                // Navigate to medication list
                if (navigateOnSuccess) {
                    setTimeout(() => {
                        navigate('/medications');
                    }, 1500);
                }
            } else {
                throw new Error('모든 약물 등록에 실패했습니다.');
            }

            return batchResult;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || '약물 등록 중 오류가 발생했습니다';
            setError(errorMsg);

            // Show error message
            alert(`등록 실패: ${errorMsg}`);

            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * 상태 초기화
     */
    const reset = () => {
        setLoading(false);
        setError(null);
        setResult(null);
    };

    return {
        registerMedications,
        loading,
        error,
        result,
        reset,
    };
};

export default useOcrRegistration;
