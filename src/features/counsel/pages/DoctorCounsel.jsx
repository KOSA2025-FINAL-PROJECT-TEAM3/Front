import { useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import styles from './DoctorCounsel.module.scss'
import { counselApiClient } from '@core/services/api/counselApiClient'

export const DoctorCounselPage = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    const text = message.trim()
    if (!text) return
    const res = await counselApiClient.submit(text)
    alert(`상담 요청이 등록되었습니다. 티켓: ${res.ticketId}`)
    setMessage('')
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>의사 상담</h1>
          <p>궁금한 내용을 작성해 상담을 요청해 보세요 (모의)</p>
        </header>

        <section className={styles.panel}>
          <label htmlFor="counsel-text" className={styles.label}>
            상담 내용
          </label>
          <textarea
            id="counsel-text"
            className={styles.textarea}
            placeholder="예) 최근 두통이 잦고, 복용 중인 약과 건강보조식품 상호작용이 걱정돼요."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={handleSubmit}>
              상담 요청 (Mock)
            </button>
          </div>

          <p className={styles.hint}>
            실제 상담 기능은 Stage 4 이후 연동 예정입니다.
          </p>
        </section>
      </div>
    </MainLayout>
  )
}

export default DoctorCounselPage

