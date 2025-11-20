import { USER_ROLES } from '@config/constants'

export const normalizeCustomerRole = (role) => {
  if (!role) return null
  if (role === USER_ROLES.SENIOR || role === USER_ROLES.CAREGIVER) {
    return role
  }

  if (typeof role === 'string') {
    const upper = role.toUpperCase()
    if (upper === USER_ROLES.SENIOR) return USER_ROLES.SENIOR
    if (upper === USER_ROLES.CAREGIVER) return USER_ROLES.CAREGIVER
  }

  return null
}

export const isCaregiverRole = (role) => normalizeCustomerRole(role) === USER_ROLES.CAREGIVER

export const getCustomerRoleLabel = (role) => {
  const normalized = normalizeCustomerRole(role)
  if (normalized === USER_ROLES.CAREGIVER) return '보호자'
  if (normalized === USER_ROLES.SENIOR) return '어르신'
  return '사용자'
}
