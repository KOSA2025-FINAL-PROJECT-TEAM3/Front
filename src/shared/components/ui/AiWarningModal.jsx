import Modal from './Modal'
import styles from './AiWarningModal.module.scss'

const DEFAULT_MESSAGE = 'AI 기능은 정확하지 않습니다. 약은 약사와, 병 증세 진단은 의사와 상담하셔야 합니다.'

export const AiWarningModal = ({ isOpen, onClose, contextMessage, footer }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="AI 생성 정보 주의"
    description="AI 검색 결과는 참고용으로만 활용해주세요."
    footer={
      footer ?? (
        <button type="button" className={styles.confirmButton} onClick={onClose}>
          확인했어요
        </button>
      )
    }
  >
    <div className={styles.warningBox}>
      <div className={styles.icon} aria-hidden="true">
        ⚠️
      </div>
      <div className={styles.texts}>
        <p className={styles.headline}>AI 생성 내용은 부정확할 수 있습니다.</p>
        <p className={styles.message}>{DEFAULT_MESSAGE}</p>
        {contextMessage && <p className={styles.context}>{contextMessage}</p>}
      </div>
    </div>
  </Modal>
)

export default AiWarningModal
