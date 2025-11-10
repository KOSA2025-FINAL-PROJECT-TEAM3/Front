import { useContext } from 'react'
import { FamilyContext } from './familyContextObject'

export const useFamilyContext = () => {
  const context = useContext(FamilyContext)
  if (context === null) {
    throw new Error('useFamilyContext는 FamilyProvider 내부에서만 사용할 수 있습니다.')
  }
  return context
}
