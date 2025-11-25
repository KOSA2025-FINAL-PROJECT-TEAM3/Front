import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@shared/components/layout/MainLayout';
import CameraCapture from '../components/CameraCapture';
import ScanResultList from '../components/ScanResultList';
import { ocrApiClient } from '@core/services/api/ocrApiClient';
import styles from './PrescriptionScan.module.scss';
import { ROUTE_PATHS } from '@config/routes.config';

const PrescriptionScanPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // select, camera, preview, analyzing, result
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanResults, setScanResults] = useState([]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep('preview');
    }
  };

  const handleCameraCapture = (capturedFile) => {
    setFile(capturedFile);
    setPreviewUrl(URL.createObjectURL(capturedFile));
    setStep('preview');
  };

  const startAnalysis = async () => {
    if (!file) return;
    setStep('analyzing');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await ocrApiClient.scan(formData);

      if (response.success && response.data && response.data.medications) {
        setScanResults(response.data.medications);
        setStep('result');
      } else {
        alert('약 정보를 찾을 수 없습니다.');
        setStep('select');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('분석 중 오류가 발생했습니다.');
      setStep('select');
    }
  };

  const handleRegister = () => {
    // TODO: Register medications to backend
    console.log('Registering:', scanResults);
    alert('약이 등록되었습니다.');
    navigate(ROUTE_PATHS.medication);
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {step === 'select' && (
          <div className={styles.selectStep}>
            <h2>처방전 등록</h2>
            <p>처방전을 촬영하거나 앨범에서 선택해주세요.</p>
            <div className={styles.buttons}>
              <button className={styles.cameraBtn} onClick={() => setStep('camera')}>
                카메라 촬영
              </button>
              <label className={styles.galleryBtn}>
                앨범에서 선택
                <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
              </label>
            </div>
          </div>
        )}

        {step === 'camera' && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onCancel={() => setStep('select')}
          />
        )}

        {step === 'preview' && (
          <div className={styles.previewStep}>
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            <div className={styles.actions}>
              <button className={styles.retryBtn} onClick={() => setStep('select')}>다시 선택</button>
              <button className={styles.analyzeBtn} onClick={startAnalysis}>분석 시작</button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className={styles.analyzingStep}>
            <div className={styles.loader}></div>
            <p>처방전을 분석하고 있습니다...</p>
          </div>
        )}

        {step === 'result' && (
          <div className={styles.resultStep}>
            <div className={styles.resultHeader}>
              <h2>분석 결과</h2>
              <p>내용을 확인하고 수정해주세요.</p>
            </div>
            <ScanResultList
              results={scanResults}
              onChange={setScanResults}
              onRemove={(index) => {
                const newResults = [...scanResults];
                newResults.splice(index, 1);
                setScanResults(newResults);
              }}
            />
            <div className={styles.resultActions}>
              <button className={styles.cancelBtn} onClick={() => setStep('select')}>취소</button>
              <button className={styles.registerBtn} onClick={handleRegister}>등록하기</button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PrescriptionScanPage;
