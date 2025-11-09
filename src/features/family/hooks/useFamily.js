/**
 * useFamily - 가족 관리 데이터를 제공하는 커스텀 훅
 */

import { useFamilyContext } from '../context/FamilyContext'

export const useFamily = () => {
  return useFamilyContext()
}

export default useFamily
