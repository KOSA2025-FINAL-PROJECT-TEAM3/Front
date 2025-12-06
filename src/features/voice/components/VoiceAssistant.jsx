import React from 'react'
import classNames from 'classnames'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { useVoiceStore } from '../stores/voiceStore'
import styles from './VoiceAssistant.module.scss'

// 마이크 아이콘 (Heroicons)
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 9.375v1.875a.75.75 0 01-1.5 0v-1.875a6.751 6.751 0 01-6-9.375v-1.5a.75.75 0 01.75-.75z" />
  </svg>
)

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
)

export const VoiceAssistant = () => {
  const { isListening, toggleVoice } = useVoiceRecognition()
  const { transcript, feedbackMessage } = useVoiceStore()

  return (
    <>
      {/* 듣고 있을 때 화면 전체를 어둡게 하고 피드백 표시 */}
      {isListening && (
        <div className={styles.overlay}>
          <div className={styles.feedbackBox}>
            <h3>{feedbackMessage || "말씀해주세요..."}</h3>
            <p>{transcript}</p>
          </div>
        </div>
      )}

      <div className={styles.voiceContainer}>
        <button 
          className={classNames(styles.micButton, { [styles.listening]: isListening })}
          onClick={toggleVoice}
          aria-label="음성 명령 시작"
        >
          {isListening ? <StopIcon /> : <MicIcon />}
        </button>
      </div>
    </>
  )
}
