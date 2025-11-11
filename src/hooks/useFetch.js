/**
 * useFetch Hook
 * - API ?몄텧??媛꾪렪?섍쾶 泥섎━?섎뒗 而ㅼ뒪? ?? * - 濡쒕뵫, ?먮윭, ?곗씠???곹깭 愿由? */

import { useState, useEffect, useCallback } from 'react'
import httpClient from '@core/services/api/httpClient'

/**
 * API ?몄텧??泥섎━?섎뒗 而ㅼ뒪? ?? * @param {string} url - API ?붾뱶?ъ씤?? * @param {Object} options - ?듭뀡 (method, body, headers ??
 * @param {boolean} skip - ?먮룞 ?ㅽ뻾 嫄대꼫?곌린
 * @returns {Object} ?곗씠?? 濡쒕뵫 ?곹깭, ?먮윭, ?섎룞 ?몄텧 ?⑥닔
 */
export const useFetch = (url, options = {}, skip = false) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState(null)

  /**
   * API ?몄텧 ?ㅽ뻾
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
      const errorMessage = err.response?.data?.message || err.message || '?붿껌 ?ㅽ뙣'
      setError(errorMessage)
      console.error(`API ?몄텧 ?ㅽ뙣: ${url}`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, options])

  /**
   * 而댄룷?뚰듃 留덉슫?????먮룞?쇰줈 ?곗씠??媛?몄삤湲?   */
  useEffect(() => {
    if (!skip) {
      fetchData()
    }
  }, [url, skip, fetchData])

  /**
   * ?곗씠???섎룞?쇰줈 ?덈줈怨좎묠
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
