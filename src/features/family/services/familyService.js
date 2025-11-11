/**
 * FamilyMockService
 * - Stage 3 요구사항: React Query + Mock Provider
 * - Dev Mode/로컬 환경에서 가족 데이터를 localStorage에 저장/조회
 * - 초기 목(mock) 데이터는 '@/data/mockFamily'에서 가져와 사용합니다.
 */

import { STORAGE_KEYS } from '@config/constants'
import {
  DEFAULT_FAMILY_GROUP,
  DEFAULT_FAMILY_MEMBERS,
  DEFAULT_MEMBER_DETAILS,
  buildNewMember,
  buildMemberDetailSnapshot,
} from '@/data/mockFamily'

const FAMILY_STORAGE_KEY = STORAGE_KEYS.FAMILY_GROUP
const MEMBER_DETAIL_STORAGE_KEY = STORAGE_KEYS.FAMILY_MEMBER_DETAILS

const readSnapshot = () => {
  if (typeof window === 'undefined') {
    return {
      group: DEFAULT_FAMILY_GROUP,
      members: DEFAULT_FAMILY_MEMBERS,
    }
  }

  const stored = window.localStorage.getItem(FAMILY_STORAGE_KEY)
  if (!stored) {
    return {
      group: DEFAULT_FAMILY_GROUP,
      members: DEFAULT_FAMILY_MEMBERS,
    }
  }

  try {
    const parsed = JSON.parse(stored)
    if (parsed?.group && Array.isArray(parsed?.members)) {
      return parsed
    }
  } catch (error) {
    console.warn('[FamilyMockService] Failed to parse snapshot', error)
  }

  return {
    group: DEFAULT_FAMILY_GROUP,
    members: DEFAULT_FAMILY_MEMBERS,
  }
}

const persistSnapshot = (group, members) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    FAMILY_STORAGE_KEY,
    JSON.stringify({ group, members }),
  )
}

const readMemberDetails = () => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_MEMBER_DETAILS }
  }
  const stored = window.localStorage.getItem(MEMBER_DETAIL_STORAGE_KEY)
  if (!stored) {
    return { ...DEFAULT_MEMBER_DETAILS }
  }
  try {
    return JSON.parse(stored)
  } catch (error) {
    console.warn('[FamilyMockService] Failed to parse member details', error)
    return { ...DEFAULT_MEMBER_DETAILS }
  }
}

const persistMemberDetails = (details) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    MEMBER_DETAIL_STORAGE_KEY,
    JSON.stringify(details),
  )
}

const cloneDefaultGroup = () => JSON.parse(JSON.stringify(DEFAULT_FAMILY_GROUP))
const cloneDefaultMembers = () =>
  DEFAULT_FAMILY_MEMBERS.map((member) => ({ ...member }))
const cloneDefaultDetails = () =>
  JSON.parse(JSON.stringify(DEFAULT_MEMBER_DETAILS))

const ensureSeedData = () => {
  const snapshot = readSnapshot()
  const details = readMemberDetails()
  if (typeof window !== 'undefined') {
    persistSnapshot(snapshot.group, snapshot.members)
    persistMemberDetails(details)
  }
  return { snapshot, details }
}

/**
 * Dev Mode용 가족 서비스 (Mock)
 */
export const FamilyMockService = {
  /**
   * 가족 데이터 조회
   * @returns {Promise<{group: object, members: Array}>}
   */
  async getFamily() {
    return ensureSeedData().snapshot
  },

  /**
   * 가족 멤버 초대
   * @param {{name: string, email: string, role: string}} payload
   * @returns {Promise<object>} 생성된 멤버
   */
  async inviteMember(payload) {
    const { snapshot, details } = ensureSeedData()
    const { group, members } = snapshot
    const trimmedName = payload?.name?.trim()

    if (!trimmedName || !payload?.email) {
      throw new Error('구성원 이름/이메일이 필요합니다.')
    }

    const nextMember = buildNewMember({
      name: trimmedName,
      email: payload.email,
      role: payload.role || 'CAREGIVER',
    })

    const nextMembers = [...members, nextMember]
    persistSnapshot(group, nextMembers)
    persistMemberDetails({
      ...details,
      [nextMember.id]: buildMemberDetailSnapshot(nextMember.name),
    })
    return nextMember
  },

  /**
   * 가족 멤버 삭제
   * @param {string} memberId
   * @returns {Promise<{group: object, members: Array}>}
   */
  async removeMember(memberId) {
    const { snapshot, details } = ensureSeedData()
    const { group, members } = snapshot
    const filtered = members.filter((member) => member.id !== memberId)
    persistSnapshot(group, filtered)
    if (details[memberId]) {
      const updatedDetails = { ...details }
      delete updatedDetails[memberId]
      persistMemberDetails(updatedDetails)
    }
    return {
      group,
      members: filtered,
    }
  },

  /**
   * 가족 구성원 상세 정보 조회
   * @param {string} memberId
   * @returns {Promise<{member: Object, medications: Array, adherence: number}>}
   */
  async getMemberDetail(memberId) {
    const { snapshot, details } = ensureSeedData()
    const member = snapshot.members.find((m) => m.id === memberId)
    if (!member) {
      return null
    }
    const detail = details[memberId] || { adherence: 0, medications: [] }
    return {
      member,
      ...detail,
    }
  },

  /**
   * 약물 복용 상태 업데이트
   * @param {string} memberId
   * @param {number} medicationIndex - 약물 인덱스 (0-based)
   * @param {string} newStatusLabel - 새로운 상태 라벨 (예: '복용 완료', '미복용')
   * @returns {Promise<object>} 업데이트된 멤버 상세 정보
   */
  async updateMedicationStatus(memberId, medicationIndex, newStatusLabel) {
    const { details } = ensureSeedData()
    const memberDetail = details[memberId]

    if (!memberDetail || !memberDetail.medications[medicationIndex]) {
      throw new Error('Member or medication not found')
    }

    const updatedMedications = [...memberDetail.medications]
    updatedMedications[medicationIndex] = {
      ...updatedMedications[medicationIndex],
      statusLabel: newStatusLabel,
    }

    const updatedDetails = {
      ...details,
      [memberId]: {
        ...memberDetail,
        medications: updatedMedications,
      },
    }

    persistMemberDetails(updatedDetails)
    return updatedDetails[memberId]
  },
}

export const resetFamilyMockData = () => {
  const group = cloneDefaultGroup()
  const members = cloneDefaultMembers()
  const details = cloneDefaultDetails()
  persistSnapshot(group, members)
  persistMemberDetails(details)
  return { group, members, details }
}

export default FamilyMockService
