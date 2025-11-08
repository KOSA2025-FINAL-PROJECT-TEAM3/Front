/**
 * useDebounce Hook
 * - 값 변경을 지연시켜 불필요한 렌더링이나 API 호출을 줄임
 * - 검색, 필터링 등에 유용
 */

import { useState, useEffect } from 'react'

/**
 * 값을 지정된 딜레이 후에 반영하는 훅
 * @param {*} value - 감시할 값
 * @param {number} delay - 지연 시간 (ms) - 기본값 500ms
 * @returns {*} 디바운스된 값
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // 딜레이 후 값 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 정리: 컴포넌트 언마운트 또는 의존성 변경 시 타이머 취소
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
