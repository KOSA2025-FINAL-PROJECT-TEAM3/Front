import MainLayout from '@shared/components/layout/MainLayout'
import styles from './NotificationSettings.module.scss'

const channels = [
  { id: 'push', label: '푸시 알림', description: '앱 푸시로 복약 알림 받기' },
  { id: 'email', label: '이메일 알림', description: '약 일정 요약 메일' },
  { id: 'sms', label: 'SMS 알림', description: '긴급 미복약 알림' },
]

export const NotificationSettingsPage = () => {
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>알림 설정</h1>
          <p>받고 싶은 알림 채널을 선택하세요.</p>
        </header>

        <section className={styles.channelList}>
          {channels.map((channel) => (
            <label key={channel.id} className={styles.channelItem}>
              <div>
                <p className={styles.label}>{channel.label}</p>
                <p className={styles.description}>{channel.description}</p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </section>
      </div>
    </MainLayout>
  )
}

export default NotificationSettingsPage
