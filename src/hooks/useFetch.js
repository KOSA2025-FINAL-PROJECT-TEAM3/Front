/**
 * useFetch Hook
 * - API 호출을 간편하게 처리하는 커스텀 훅
 * - 로딩, 에러, 데이터 상태 관리
 */

import { useState, useEffect, useCallback } from 'react'
import httpClient from '@core/services/api/httpClient'

/**
 * API 호출을 처리하는 커스텀 훅
 * @param {string} url - API 엔드포인트
 * @param {Object} options - 옵션 (method, body, headers 등)
 * @param {boolean} skip - 자동 실행 건너뛰기
 * @returns {Object} 데이터, 로딩 상태, 에러, 수동 호출 함수
 */
export const useFetch = (url, options = {}, skip = false) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState(null)

  /**
   * API 호출 실행
   */
  const fetchData = useCallback(async (customOptions = {}) => {
    setLoading(true)
    setError(null)

    try {
      const finalOptions = {
        method: 'GET',
        ...options,
        ...customOptions,
      }

      const response = await httpClient.request({
        url,
        ...finalOptions,
      })

      const payload = response?.data ?? response
      setData(payload)
      return payload
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || '요청 실패'
      setError(errorMessage)
      console.error(`API 호출 실패: ${url}`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, options])

  /**
   * 컴포넌트 마운트 시 자동으로 데이터 가져오기
   */
  useEffect(() => {
    if (!skip) {
      fetchData()
    }
  }, [url, skip, fetchData])

  /**
   * 데이터 수동으로 새로고침
   */
  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    fetchData,
    refetch,
  }
}
