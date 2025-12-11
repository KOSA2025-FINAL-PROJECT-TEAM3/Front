/**
 * 데이터 형식 변환 유틸리티 함수들
 * - 날짜, 시간, 숫자, 문자열 형식 변환
 */

import { format, parseISO, formatDistance } from 'date-fns'
import { ko } from 'date-fns/locale'
import logger from './logger'

/**
 * 날짜를 지정된 형식으로 포맷
 * @param {Date|string} date - 포맷할 날짜
 * @param {string} formatStr - 형식 문자열 (기본값: 'yyyy-MM-dd')
 * @returns {string} 포맷된 날짜
 */
export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: ko })
  } catch (error) {
    logger.error('날짜 포맷 실패:', error)
    return ''
  }
}

/**
 * 날짜를 상대적 시간으로 표현 (예: '2시간 전')
 * @param {Date|string} date - 변환할 날짜
 * @returns {string} 상대적 시간
 */
export const formatRelativeTime = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistance(dateObj, new Date(), { locale: ko, addSuffix: true })
  } catch (error) {
    logger.error('상대시간 포맷 실패:', error)
    return ''
  }
}

/**
 * 시간을 HH:MM 형식으로 포맷
 * @param {string|Date} time - 포맷할 시간
 * @returns {string} 포맷된 시간
 */
export const formatTime = (time) => {
  try {
    const timeObj = typeof time === 'string' ? parseISO(`2000-01-01T${time}`) : time
    return format(timeObj, 'HH:mm', { locale: ko })
  } catch (error) {
    logger.error('시간 포맷 실패:', error)
    return ''
  }
}

/**
 * 날짜와 시간을 함께 포맷
 * @param {Date|string} dateTime - 포맷할 날짜시간
 * @returns {string} 포맷된 날짜시간
 */
export const formatDateTime = (dateTime) => {
  try {
    const dateObj = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
    return format(dateObj, 'yyyy-MM-dd HH:mm', { locale: ko })
  } catch (error) {
    logger.error('날짜시간 포맷 실패:', error)
    return ''
  }
}

/**
 * 숫자에 천단위 쉼표 추가
 * @param {number} number - 포맷할 숫자
 * @returns {string} 포맷된 숫자
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('ko-KR').format(number)
}

/**
 * 전화번호 포맷 (010-1234-5678)
 * @param {string} phone - 포맷할 전화번호
 * @returns {string} 포맷된 전화번호
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  return phone
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 크기
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 문자열의 첫 글자를 대문자로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} 변환된 문자열
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 문자열을 원하는 길이만큼 자르고 '...' 추가
 * @param {string} str - 잘라낼 문자열
 * @param {number} maxLength - 최대 길이
 * @returns {string} 처리된 문자열
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return ''
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

/**
 * 빈 값을 '-'로 표시
 * @param {*} value - 확인할 값
 * @returns {string|*} '-' 또는 원본 값
 */
export const formatEmpty = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return value
}

/**
 * 부울린 값을 문자열로 변환
 * @param {boolean} value - 변환할 부울린 값
 * @returns {string} '예' 또는 '아니오'
 */
export const formatBoolean = (value) => {
  return value ? '예' : '아니오'
}

/**
 * 백분율 형식으로 변환
 * @param {number} value - 변환할 값 (0-1)
 * @param {number} decimals - 소수점 자리수
 * @returns {string} 백분율 문자열
 */
export const formatPercent = (value, decimals = 0) => {
  return `${(value * 100).toFixed(decimals)}%`
}