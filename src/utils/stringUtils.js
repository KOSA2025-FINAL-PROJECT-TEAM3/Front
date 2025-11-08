/**
 * 문자열 처리 유틸리티 함수들
 * - 문자열 변환, 조작 등
 */

/**
 * 문자열을 camelCase로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} camelCase 문자열
 */
export const toCamelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
}

/**
 * 문자열을 snake_case로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} snake_case 문자열
 */
export const toSnakeCase = (str) => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

/**
 * 문자열을 PascalCase로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} PascalCase 문자열
 */
export const toPascalCase = (str) => {
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * 문자열을 kebab-case로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} kebab-case 문자열
 */
export const toKebabCase = (str) => {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/^-+/, '')
}

/**
 * 공백으로 구분된 단어들을 각각 대문자로 변환 (Title Case)
 * @param {string} str - 변환할 문자열
 * @returns {string} Title Case 문자열
 */
export const toTitleCase = (str) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * 문자열의 모든 문자를 대문자로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} 대문자 문자열
 */
export const toUpperCase = (str) => {
  return str.toUpperCase()
}

/**
 * 문자열의 모든 문자를 소문자로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} 소문자 문자열
 */
export const toLowerCase = (str) => {
  return str.toLowerCase()
}

/**
 * 문자열의 앞뒤 공백 제거
 * @param {string} str - 처리할 문자열
 * @returns {string} 공백이 제거된 문자열
 */
export const trim = (str) => {
  return str?.trim() || ''
}

/**
 * 문자열의 모든 공백 제거
 * @param {string} str - 처리할 문자열
 * @returns {string} 공백이 제거된 문자열
 */
export const removeWhitespace = (str) => {
  return str.replace(/\s+/g, '')
}

/**
 * 문자열 반복
 * @param {string} str - 반복할 문자열
 * @param {number} count - 반복 횟수
 * @returns {string} 반복된 문자열
 */
export const repeat = (str, count) => {
  return str.repeat(count)
}

/**
 * 문자열 역순
 * @param {string} str - 역순할 문자열
 * @returns {string} 역순된 문자열
 */
export const reverse = (str) => {
  return str.split('').reverse().join('')
}

/**
 * 문자열 반복 여부 확인
 * @param {string} str - 확인할 문자열
 * @param {string} substr - 찾을 부분 문자열
 * @returns {boolean} 포함 여부
 */
export const includes = (str, substr) => {
  return str.includes(substr)
}

/**
 * 문자열 시작 여부 확인
 * @param {string} str - 확인할 문자열
 * @param {string} prefix - 확인할 접두사
 * @returns {boolean} 시작 여부
 */
export const startsWith = (str, prefix) => {
  return str.startsWith(prefix)
}

/**
 * 문자열 끝 여부 확인
 * @param {string} str - 확인할 문자열
 * @param {string} suffix - 확인할 접미사
 * @returns {boolean} 끝 여부
 */
export const endsWith = (str, suffix) => {
  return str.endsWith(suffix)
}

/**
 * URL 인코딩
 * @param {string} str - 인코딩할 문자열
 * @returns {string} 인코딩된 문자열
 */
export const encodeUrl = (str) => {
  return encodeURIComponent(str)
}

/**
 * URL 디코딩
 * @param {string} str - 디코딩할 문자열
 * @returns {string} 디코딩된 문자열
 */
export const decodeUrl = (str) => {
  return decodeURIComponent(str)
}

/**
 * Base64 인코딩
 * @param {string} str - 인코딩할 문자열
 * @returns {string} Base64 인코딩된 문자열
 */
export const encodeBase64 = (str) => {
  return btoa(unescape(encodeURIComponent(str)))
}

/**
 * Base64 디코딩
 * @param {string} str - 디코딩할 문자열
 * @returns {string} 디코딩된 문자열
 */
export const decodeBase64 = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch (error) {
    console.error('Base64 디코딩 실패:', error)
    return ''
  }
}
