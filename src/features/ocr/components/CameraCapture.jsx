import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import styles from './CameraCapture.module.scss';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment"
};

const CameraCapture = ({ onCapture, onCancel }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          onCapture(file);
        });
    }
  }, [webcamRef, onCapture]);

  return (
    <div className={styles.cameraContainer}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className={styles.webcam}
      />
      <div className={styles.overlay}>
        <div className={styles.guideBox}>
          <p className={styles.guideText}>처방전을 사각형 안에 맞춰주세요</p>
        </div>
      </div>
      <div className={styles.controls}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.captureBtn} onClick={capture}>
          <div className={styles.shutterInner} />
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
