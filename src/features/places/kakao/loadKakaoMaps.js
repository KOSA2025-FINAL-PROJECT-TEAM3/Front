const getKakaoMapsSdkUrl = (appKey) =>
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`

export const loadKakaoMaps = (appKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Kakao Maps can only be loaded in the browser'))
  }

  if (!appKey) {
    return Promise.reject(new Error('Missing VITE_KAKAO_JAVASCRIPT_KEY'))
  }

  if (window.kakao?.maps?.load) {
    return new Promise((resolve) => {
      window.kakao.maps.load(() => resolve(window.kakao))
    })
  }

  if (window.__kakaoMapsSdkPromise) {
    return window.__kakaoMapsSdkPromise
  }

  window.__kakaoMapsSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kakao-maps-sdk="true"]')
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(() => resolve(window.kakao)))
      existing.addEventListener('error', () => reject(new Error('Failed to load Kakao Maps SDK')))
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = getKakaoMapsSdkUrl(appKey)
    script.dataset.kakaoMapsSdk = 'true'
    script.onload = () => {
      if (!window.kakao?.maps?.load) {
        reject(new Error('Kakao Maps SDK loaded but window.kakao.maps.load is missing'))
        return
      }
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'))
    document.head.appendChild(script)
  })

  return window.__kakaoMapsSdkPromise
}

