import React from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import CameraCapture from '../components/CameraCapture'
import {
  PharmacyHeader,
  MedicationCardList,
  IntakeTimePicker,
  DurationPicker,
  RegistrationInfo
} from '../components'
import { useOcrRegistration } from '../hooks/useOcrRegistration'
import styles from './PrescriptionScan.module.scss'

/**
 * 처방전 스캔 및 약물 등록 페이지
 *
 * 플로우:
 * 1. select: 카메라/앨범 선택
 * 2. camera: 카메라 촬영
 * 3. preview: 이미지 미리보기
 * 4. analyzing: OCR 분석 중
 * 5. edit: 결과 확인 및 수정 (이미지 1~4 UI)
 * 6. registering: 등록 중
 */
const PrescriptionScanPage = () => {
  const {
    // 상태
    step,
    file,
    previewUrl,
    formState,
    isLoading,
    error,

    // 액션
    setStep,
    handleFileSelect,
    handleCameraCapture,
    startAnalysis,
    updateFormState,
    updateMedication,
    removeMedication,
    addMedication,
    updateIntakeTime,
    addIntakeTime,
    removeIntakeTime,
    handleRegister,
    reset
  } = useOcrRegistration()

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* 에러 메시지 */}
        {error && (
          <div className={styles.errorBanner}>
            <span>❌ {error}</span>
            <button onClick={() => reset()}>다시 시도</button>
          </div>
        )}

        {/* Step 1: 선택 화면 */}
        {step === 'select' && (
          <div className={styles.selectStep}>
            <h2>처방전 등록</h2>
            <p>처방전을 촬영하거나 앨범에서 선택해주세요.</p>
            <div className={styles.buttons}>
              <button
                className={styles.cameraBtn}
                onClick={() => setStep('camera')}
              >
                📷 카메라 촬영
              </button>
              <label className={styles.galleryBtn}>
                🖼️ 앨범에서 선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  hidden
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 2: 카메라 */}
        {step === 'camera' && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onCancel={() => setStep('select')}
          />
        )}

        {/* Step 3: 미리보기 */}
        {step === 'preview' && (
          <div className={styles.previewStep}>
            <h2>이미지 확인</h2>
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            <div className={styles.actions}>
              <button
                className={styles.retryBtn}
                onClick={() => setStep('select')}
              >
                다시 선택
              </button>
              <button
                className={styles.analyzeBtn}
                onClick={startAnalysis}
                disabled={isLoading}
              >
                분석 시작
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 분석 중 */}
        {step === 'analyzing' && (
          <div className={styles.analyzingStep}>
            <div className={styles.loader}></div>
            <p>처방전을 분석하고 있습니다...</p>
            <span className={styles.subText}>AI가 약물 정보를 추출 중입니다</span>
          </div>
        )}

        {/* Step 5: 결과 편집 (메인 UI - 이미지 1~4) */}
        {step === 'edit' && (
          <div className={styles.editStep}>
            {/* 헤더: 약국명 */}
            <PharmacyHeader
              pharmacyName={formState.pharmacyName}
              onNameChange={(name) => updateFormState({ pharmacyName: name })}
            />

            {/* 약물 목록 카드 */}
            <MedicationCardList
              medications={formState.medications}
              onUpdate={updateMedication}
              onRemove={removeMedication}
              onAdd={addMedication}
            />

            {/* 일 복용 횟수 / 시간 요약 */}
            <div className={styles.summaryBar}>
              <span>일 복용 횟수 <strong>{formState.intakeTimes.length}회</strong></span>
              <span className={styles.times}>
                {formState.intakeTimes.map(t => t.label).join(' | ')}
              </span>
            </div>

            {/* 복용 기간 */}
            <DurationPicker
              startDate={formState.startDate}
              endDate={formState.endDate}
              onUpdate={updateFormState}
            />

            {/* 복용 시간 상세 설정 */}
            <IntakeTimePicker
              intakeTimes={formState.intakeTimes}
              onUpdate={updateIntakeTime}
              onAdd={addIntakeTime}
              onRemove={removeIntakeTime}
            />

            {/* 등록 정보 */}
            <RegistrationInfo
              hospitalName={formState.hospitalName}
              pharmacyName={formState.pharmacyName}
              paymentAmount={formState.paymentAmount}
              onUpdate={updateFormState}
              createdDate={new Date().toLocaleDateString('ko-KR').replace(/\./g, '.').slice(0, -1)}
            />

            {/* 하단 버튼 */}
            <div className={styles.bottomActions}>
              <button
                className={styles.editBtn}
                onClick={() => setStep('select')}
              >
                다시 촬영
              </button>
              <button
                className={styles.registerBtn}
                onClick={handleRegister}
                disabled={isLoading || formState.medications.length === 0}
              >
                {isLoading ? '등록 중...' : '등록 완료'}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: 등록 중 */}
        {step === 'registering' && (
          <div className={styles.registeringStep}>
            <div className={styles.loader}></div>
            <p>약물을 등록하고 있습니다...</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default PrescriptionScanPage
