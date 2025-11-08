/**
 * useLocalStorage Hook
 * - 로컬 스토리지와 동기화되는 상태 관리
 * - 페이지 새로고침 후에도 데이터 유지
 */

import { useState, useEffect } from 'react'

/**
 * 로컬 스토리지와 동기화되는 상태를 제공하는 훅
 * @param {string} key - 로컬 스토리지 키
 * @param {*} initialValue - 초기값
 * @returns {[*, Function]} 상태 값과 설정 함수
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // 로컬 스토리지에서 값 가져오기
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`localStorage에서 '${key}' 읽기 실패:`, error)
      return initialValue
    }
  })

  /**
   * 로컬 스토리지에 값을 저장하고 상태를 업데이트
   */
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`localStorage에 '${key}' 저장 실패:`, error)
    }
  }

  /**
   * 로컬 스토리지에서 값 제거
   */
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`localStorage에서 '${key}' 제거 실패:`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}
