import logger from "@core/utils/logger"
import { useEffect, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import ChatRoomCard from '../components/ChatRoomCard'
import { chatApiClient } from '@/core/services/api/chatApiClient'
import styles from './DoctorChatListPage.module.scss'

/**
 * DoctorChatListPage - 의사/AI 챗봇 상담 목록 페이지
 */
export const DoctorChatListPage = () => {
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatApiClient.getRooms()
      setRooms(response.rooms || [])
    } catch (err) {
      logger.error('채팅방 목록 로드 실패:', err)
      setError('채팅방 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewChat = async () => {
    // TODO: 의사/AI 챗봇 선택 모달 구현 후 연동
    alert('준비 중인 기능입니다.')
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>의사 상담</h1>
          <button className={styles.newChatButton} onClick={handleCreateNewChat}>
            + 새 상담
          </button>
        </header>

        {isLoading && (
          <div className={styles.loading}>
            <p>채팅방 목록을 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadRooms}>다시 시도</button>
          </div>
        )}

        {!isLoading && !error && rooms.length === 0 && (
          <div className={styles.empty}>
            <p>아직 상담 내역이 없습니다.</p>
            <p className={styles.hint}>의사 또는 AI 챗봇에게 궁금한 점을 물어보세요!</p>
            <button className={styles.startButton} onClick={handleCreateNewChat}>
              첫 상담 시작하기
            </button>
          </div>
        )}

        {!isLoading && !error && rooms.length > 0 && (
          <div className={styles.roomList}>
            {rooms.map((room) => (
              <ChatRoomCard key={room.roomId} room={room} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default DoctorChatListPage
