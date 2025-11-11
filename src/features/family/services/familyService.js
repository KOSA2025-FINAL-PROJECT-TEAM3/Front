/**
 * FamilyMockService
 * - Stage 3 ?붽뎄?ы빆: React Query + Mock Provider
 * - Dev Mode/濡쒖뺄 ?섍꼍?먯꽌 媛議??곗씠?곕? localStorage?????議고쉶
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
 * Dev Mode??媛議??쒕퉬??(Mock)
 */
export const FamilyMockService = {
  /**
   * 媛議??곗씠??議고쉶
   * @returns {Promise<{group: object, members: Array}>}
   */
  async getFamily() {
    return ensureSeedData().snapshot
  },

  /**
   * 媛議?硫ㅻ쾭 珥덈?
   * @param {{name: string, email: string, role: string}} payload
   * @returns {Promise<object>} ?앹꽦??硫ㅻ쾭
   */
  async inviteMember(payload) {
    const { snapshot, details } = ensureSeedData()
    const { group, members } = snapshot
    const trimmedName = payload?.name?.trim()

    if (!trimmedName || !payload?.email) {
      throw new Error('?대쫫怨??대찓?쇱쓣 ?낅젰?댁＜?몄슂.')
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
   * 媛議?硫ㅻ쾭 ??젣
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
   * 媛議?援ъ꽦???곸꽭 ?뺣낫 議고쉶
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
}

export default FamilyMockService
