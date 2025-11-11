import { useEffect, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import ChatRoomCard from '../components/ChatRoomCard'
import { chatApiClient } from '@core/services/api/chatApiClient'
import styles from './DoctorChatListPage.module.scss'

/**
 * DoctorChatListPage - ?섏궗/AI 梨쀫큸 ?곷떞 紐⑸줉 ?섏씠吏
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
      console.error('梨꾪똿諛?紐⑸줉 濡쒕뱶 ?ㅽ뙣:', err)
      setError('梨꾪똿諛?紐⑸줉??遺덈윭?ㅻ뒗???ㅽ뙣?덉뒿?덈떎.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewChat = async () => {
    try {
      // TODO: ?섏궗/AI 梨쀫큸 ?좏깮 紐⑤떖 援ы쁽 ?꾩슂
      // 吏湲덉? ?꾩떆濡???梨꾪똿諛??앹꽦
      const newRoom = await chatApiClient.createRoom('doctor_ai_001')
      setRooms([newRoom, ...rooms])
    } catch (err) {
      console.error('梨꾪똿諛??앹꽦 ?ㅽ뙣:', err)
      alert('梨꾪똿諛??앹꽦???ㅽ뙣?덉뒿?덈떎.')
    }
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>?섏궗 ?곷떞</h1>
          <button className={styles.newChatButton} onClick={handleCreateNewChat}>
            + ???곷떞
          </button>
        </header>

        {isLoading && (
          <div className={styles.loading}>
            <p>梨꾪똿諛?紐⑸줉??遺덈윭?ㅻ뒗 以?..</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadRooms}>?ㅼ떆 ?쒕룄</button>
          </div>
        )}

        {!isLoading && !error && rooms.length === 0 && (
          <div className={styles.empty}>
            <p>?꾩쭅 ?곷떞 ?댁뿭???놁뒿?덈떎.</p>
            <p className={styles.hint}>?섏궗 ?먮뒗 AI 梨쀫큸?먭쾶 沅곴툑???먯쓣 臾쇱뼱蹂댁꽭??</p>
            <button className={styles.startButton} onClick={handleCreateNewChat}>
              泥??곷떞 ?쒖옉?섍린
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

        <div className={styles.notice}>
          <p>?뮕 <strong>Stage 4 Preview</strong></p>
          <p>?ㅼ떆媛?梨꾪똿? WebSocket ?곕룞 ???쒖꽦?붾맗?덈떎.</p>
          <p>?섏궗 ?곷떞 諛?AI 梨쀫큸 湲곕뒫? 異뷀썑 援ы쁽 ?덉젙?낅땲??</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default DoctorChatListPage
