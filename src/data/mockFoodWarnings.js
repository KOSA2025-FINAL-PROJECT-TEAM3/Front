export const MOCK_FOOD_CONFLICT = {
  food: {
    name: '자몽 주스',
    description: '비타민 C가 풍부하지만 특정 약물과 상호작용',
  },
  medication: {
    name: '스타틴 계열 (Simvastatin)',
    dosage: '20mg',
    schedule: '매일 저녁 복용',
  },
  severity: 'high',
  reason:
    '자몽 주스는 CYP3A4 효소를 억제하여 스타틴 혈중 농도를 증가시켜 근육 손상 및 간 손상 위험을 높입니다.',
}

export const MOCK_ALTERNATIVES = [
  {
    id: 'alt-1',
    name: '오렌지 주스',
    benefits: '비타민 C 섭취 + 자몽과 달리 약물 상호작용 적음',
  },
  {
    id: 'alt-2',
    name: '블루베리 스무디',
    benefits: '항산화 물질 풍부, 혈관 건강 보조',
  },
  {
    id: 'alt-3',
    name: '레몬 워터',
    benefits: '수분 섭취 및 가벼운 비타민 C 제공',
  },
]
