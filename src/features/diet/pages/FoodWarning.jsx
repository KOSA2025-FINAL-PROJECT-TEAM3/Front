import MainLayout from '@shared/components/layout/MainLayout'
import FoodConflictWarning from '../components/FoodConflictWarning.jsx'
import FoodAlternativeList from '../components/FoodAlternativeList.jsx'
import { MOCK_FOOD_CONFLICT, MOCK_ALTERNATIVES } from '@/data/mockFoodWarnings'
import styles from './FoodWarning.module.scss'

export const FoodWarningPage = () => {
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>음식 충돌 경고</h1>
          <p>최근 기록된 식단과 복용 중인 약물 정보를 기반으로 자동 분석합니다.</p>
        </header>

        <FoodConflictWarning conflict={MOCK_FOOD_CONFLICT} />

        <FoodAlternativeList items={MOCK_ALTERNATIVES} />
      </div>
    </MainLayout>
  )
}

export default FoodWarningPage
