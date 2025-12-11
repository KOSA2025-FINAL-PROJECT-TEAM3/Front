import { useEffect, useState } from 'react'

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'

export const useKakao = () => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const loadSdk = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY)
        }
        setIsInitialized(true)
        return
      }

      const script = document.createElement('script')
      script.src = KAKAO_SDK_URL
      script.crossOrigin = 'anonymous'
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY)
        }
        setIsInitialized(true)
      }
      document.head.appendChild(script)
    }

    loadSdk()
  }, [])

  const shareInvite = (inviteUrl, inviterName = '가족') => {
    if (!isInitialized || !window.Kakao) {
      alert('카카오톡 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    console.log('[useKakao] Sharing Invite:', { inviteUrl, inviterName }) // Debug Log

    const title = '💌 가족 그룹 초대장이 도착했습니다!'
    const description = `${inviterName}님을 가족 그룹에 초대합니다.\n함께 건강 관리를 시작해보세요.`

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        description: description,
        imageUrl: 'https://k.kakaocdn.net/dn/bWnQ5W/btsLwgZJ5qJ/A4kKjKjKjKjKjKjKjKjKjK/img_640x640.jpg', // Backend same image
        imageWidth: 640,
        imageHeight: 640,
        link: {
          mobileWebUrl: inviteUrl,
          webUrl: inviteUrl,
        },
      },
      buttons: [
        {
          title: '초대 수락하기',
          link: {
            mobileWebUrl: inviteUrl,
            webUrl: inviteUrl,
          },
        },
      ],
    })
  }

  return { isInitialized, shareInvite }
}

export default useKakao
// Force change
