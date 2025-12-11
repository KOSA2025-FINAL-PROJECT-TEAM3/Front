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

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${inviterName}님의 가족 초대`,
        description: '링크를 눌러 가족 그룹에 참여하세요. (로그인 필요)',
        imageUrl: 'https://amapill.com/assets/invite_preview.png', // Placeholder
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
