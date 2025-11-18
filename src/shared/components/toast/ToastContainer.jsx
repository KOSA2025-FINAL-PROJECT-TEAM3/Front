/**
 * ToastContainer Component
 * - 토스트 알림을 화면에 표시
 */

import { useToastStore } from './toastStore'
import { Toast } from './Toast'
import styles from './ToastContainer.module.scss'

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

export default ToastContainer
