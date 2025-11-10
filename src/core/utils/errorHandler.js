/**
 * 에러 처리 유틸리티
 * - API 에러, 네트워크 에러, 일반 에러 처리
 */

import { HTTP_STATUS } from '@config/constants'

/**
 * 에러 객체로부터 사용자 친화적인 메시지 추출
 * @param {Error|Object} error - 에러 객체
 * @returns {string} 에러 메시지
 */
export const getErrorMessage = (error) => {
  // Axios 에러 (응답이 있는 경우)
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    // API가 제공한 에러 메시지
    if (data?.message) {
      return data.message
    }

    // 상태 코드별 기본 메시지
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return '잘못된 요청입니다.'
      case HTTP_STATUS.UNAUTHORIZED:
        return '인증이 필요합니다.'
      case HTTP_STATUS.FORBIDDEN:
        return '접근 권한이 없습니다.'
      case HTTP_STATUS.NOT_FOUND:
        return '요청한 리소스를 찾을 수 없습니다.'
      case HTTP_STATUS.CONFLICT:
        return '요청이 충돌했습니다.'
      case HTTP_STATUS.SERVER_ERROR:
        return '서버 오류가 발생했습니다.'
      default:
        return `오류가 발생했습니다. (${status})`
    }
  }

  // 네트워크 에러 (응답이 없는 경우)
  if (error.request) {
    return '네트워크 연결을 확인해주세요.'
  }

  // 클라이언트 에러
  if (error instanceof Error) {
    return error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * 에러 로깅
 * @param {string} context - 에러가 발생한 컨텍스트
 * @param {Error|Object} error - 에러 객체
 */
export const logError = (context, error) => {
  const timestamp = new Date().toISOString()
  const message = getErrorMessage(error)

  console.error(`[${timestamp}] ${context}:`, {
    message,
    error,
  })

  // 실제 프로덕션에서는 에러 트래킹 서비스(Sentry, DataDog 등)로 전송
}

/**
 * API 에러인지 확인
 * @param {Error|Object} error - 에러 객체
 * @returns {boolean} API 에러 여부
 */
export const isApiError = (error) => {
  return error?.response !== undefined
}

/**
 * 네트워크 에러인지 확인
 * @param {Error|Object} error - 에러 객체
 * @returns {boolean} 네트워크 에러 여부
 */
export const isNetworkError = (error) => {
  return error?.message === 'Network Error' || !error?.response
}

/**
 * 에러 상태 코드 추출
 * @param {Error|Object} error - 에러 객체
 * @returns {number|null} HTTP 상태 코드
 */
export const getErrorStatusCode = (error) => {
  return error?.response?.status || null
}

/**
 * 에러 데이터 추출
 * @param {Error|Object} error - 에러 객체
 * @returns {Object|null} 에러 응답 데이터
 */
export const getErrorData = (error) => {
  return error?.response?.data || null
}

/**
 * 사용자 친화적인 에러 객체 생성
 * @param {Error|Object} error - 원본 에러 객체
 * @returns {Object} 처리된 에러 객체
 */
export const formatError = (error) => {
  return {
    message: getErrorMessage(error),
    statusCode: getErrorStatusCode(error),
    isApiError: isApiError(error),
    isNetworkError: isNetworkError(error),
    timestamp: new Date().toISOString(),
  }
}
