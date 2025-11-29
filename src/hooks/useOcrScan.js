import { useState } from 'react';
import { ocrApiClient } from '@/core/services/api/ocrApiClient';

/**
 * OCR 스캔 훅
 * 처방전 이미지를 스캔하여 약물 정보를 추출합니다.
 * 
 * @returns {Object} { scanPrescription, loading, error, result }
 */
export const useOcrScan = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    /**
     * 처방전 스캔 실행
     * 
     * @param {File} imageFile - 처방전 이미지 파일
     * @returns {Promise<OCRResponse>} OCR 결과
     */
    const scanPrescription = async (imageFile) => {
        try {
            setLoading(true);
            setError(null);

            // FormData 생성
            const formData = new FormData();
            formData.append('file', imageFile);

            // OCR API 호출
            const response = await ocrApiClient.scan(formData);

            // Backend returns ApiResponse<OCRResponse>
            // response.data is the OCRResponse object
            const ocrData = response.data || response;

            if (ocrData.success) {
                setResult(ocrData);
                return ocrData;
            } else {
                throw new Error(ocrData.errorMessage || 'OCR 처리 실패');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'OCR 스캔 중 오류가 발생했습니다';
            setError(errorMsg);
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
        scanPrescription,
        loading,
        error,
        result,
        reset,
    };
};

export default useOcrScan;
