import MainLayout from '@shared/components/layout/MainLayout'
import { NOTIFICATION_CHANNELS } from '@/data/mockUiConstants'
import styles from './NotificationSettings.module.scss'

export const NotificationSettingsPage = () => {
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>알림 설정</h1>
          <p>받고 싶은 알림 채널을 선택하세요.</p>
        </header>

        <section className={styles.channelList}>
          {NOTIFICATION_CHANNELS.map((channel) => (
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
