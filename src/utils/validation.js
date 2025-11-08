/**
 * 데이터 검증 유틸리티 함수들
 * - 이메일, 전화번호, 비밀번호 등 검증
 */

/**
 * 이메일 형식 검증
 * @param {string} email - 검증할 이메일
 * @returns {boolean} 유효 여부
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 전화번호 형식 검증 (한국)
 * @param {string} phone - 검증할 전화번호
 * @returns {boolean} 유효 여부
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(01[0-9]|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * 비밀번호 강도 검증
 * - 최소 8자, 영문, 숫자, 특수문자 포함
 * @param {string} password - 검증할 비밀번호
 * @returns {boolean} 유효 여부
 */
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/
  return passwordRegex.test(password)
}

/**
 * 비밀번호 강도 계산
 * @param {string} password - 검증할 비밀번호
 * @returns {Object} 강도 정보 (score, level, message)
 */
export const getPasswordStrength = (password) => {
  let score = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password),
  }

  // 점수 계산
  Object.values(checks).forEach((check) => {
    if (check) score++
  })

  // 강도 레벨 결정
  let level = 'weak'
  let message = '약함'

  if (score >= 4) {
    level = 'strong'
    message = '강함'
  } else if (score >= 3) {
    level = 'medium'
    message = '보통'
  }

  return { score, level, message, checks }
}

/**
 * 이름 검증 (2자 이상)
 * @param {string} name - 검증할 이름
 * @returns {boolean} 유효 여부
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2
}

/**
 * 숫자만 포함하는지 검증
 * @param {string} value - 검증할 값
 * @returns {boolean} 유효 여부
 */
export const isNumeric = (value) => {
  return /^\d+$/.test(value)
}

/**
 * URL 형식 검증
 * @param {string} url - 검증할 URL
 * @returns {boolean} 유효 여부
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 * @param {string} date - 검증할 날짜
 * @returns {boolean} 유효 여부
 */
export const isValidDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) return false

  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  )
}

/**
 * 필수 필드 검증 (빈 값 확인)
 * @param {*} value - 검증할 값
 * @returns {boolean} 유효 여부
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * 최소 길이 검증
 * @param {string} value - 검증할 값
 * @param {number} minLength - 최소 길이
 * @returns {boolean} 유효 여부
 */
export const isMinLength = (value, minLength) => {
  return value && value.length >= minLength
}

/**
 * 최대 길이 검증
 * @param {string} value - 검증할 값
 * @param {number} maxLength - 최대 길이
 * @returns {boolean} 유효 여부
 */
export const isMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength
}
