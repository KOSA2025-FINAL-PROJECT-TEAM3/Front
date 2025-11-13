/**
 * 약 상세 정보 Mock 데이터
 * @file mockPillDetails.js
 * @description 약 상세 페이지 및 검색 결과용 Mock 데이터
 */

export const MOCK_PILL_DETAILS = {
  'pill-1': {
    id: 'pill-1',
    name: 'Simvastatin',
    strength: '20mg',
    manufacturer: '삼성제약',
    form: '정제',
    color: '하얀색',
    shape: '타원형',
    imprint: 'S20',
    category: '콜레스테롤 저하제',
    description: 'HMG-CoA 환원효소 억제제로 콜레스테롤 수치를 낮추는 약입니다.',
    usages: [
      '고콜레스테롤혈증 치료',
      '심혈관질환 예방',
    ],
    sideEffects: [
      '근육통',
      '구역질',
      '피로감',
      '두통',
    ],
    precautions: [
      '자몽 주스와 함께 복용하지 마세요',
      '알코올 섭취를 제한하세요',
      '정기적인 혈액 검사가 필요합니다',
    ],
    interactions: [
      {
        substance: '자몽 주스',
        severity: 'HIGH',
        description: '약물 흡수 증가로 인한 부작용 위험',
      },
      {
        substance: 'Erythromycin',
        severity: 'MEDIUM',
        description: '약물 상호작용 가능성',
      },
    ],
    dosage: '하루 1회 저녁 식후',
    storageCondition: '실온 보관, 습기가 없는 장소',
    expiryDate: '2026-11-30',
    images: ['/images/simvastatin-1.jpg'],
    reviews: [
      {
        id: 'review-1',
        rating: 4,
        author: '김철수',
        content: '약 효과가 좋습니다. 콜레스테롤 수치가 떨어졌어요.',
        date: '2025-11-01',
      },
    ],
  },
  'pill-2': {
    id: 'pill-2',
    name: 'Metformin',
    strength: '500mg',
    manufacturer: '한미약품',
    form: '정제',
    color: '흰색',
    shape: '둥근형',
    imprint: 'M500',
    category: '당뇨병 치료제',
    description: '인슐린 저항성을 개선하고 혈당을 낮추는 약입니다.',
    usages: [
      '제2형 당뇨병 치료',
      '혈당 조절',
    ],
    sideEffects: [
      '구역질',
      '설사',
      '복부 불편감',
      '금속성 맛',
    ],
    precautions: [
      '식후 복용하세요',
      '신장 기능 검사를 정기적으로 받으세요',
      '과음을 피하세요',
    ],
    interactions: [
      {
        substance: '알코올',
        severity: 'HIGH',
        description: '저혈당 위험 증가',
      },
      {
        substance: 'Contrast dye',
        severity: 'MEDIUM',
        description: '신장 기능 저하 가능성',
      },
    ],
    dosage: '하루 2회 (아침/저녁) 식후 30분 내',
    storageCondition: '상온 보관',
    expiryDate: '2026-08-31',
    images: ['/images/metformin-1.jpg'],
    reviews: [
      {
        id: 'review-2',
        rating: 5,
        author: '이순신',
        content: '혈당 관리가 잘 됩니다.',
        date: '2025-10-15',
      },
    ],
  },
  'pill-3': {
    id: 'pill-3',
    name: 'Vitamin D',
    strength: '1000IU',
    manufacturer: '종로약품',
    form: '캡슐',
    color: '노란색',
    shape: '타원형',
    imprint: 'VD1000',
    category: '비타민 제제',
    description: '칼슘 흡수를 촉진하고 골밀도를 유지하는 비타민 D 보충제입니다.',
    usages: [
      '비타민 D 결핍 보정',
      '골다공증 예방',
      '면역력 증진',
    ],
    sideEffects: [
      '과다 복용 시 고칼슘혈증',
    ],
    precautions: [
      '과다 복용을 피하세요',
      '충분한 칼슘 섭취가 필요합니다',
    ],
    interactions: [],
    dosage: '하루 1회 아침',
    storageCondition: '실온 보관',
    expiryDate: '2026-12-31',
    images: ['/images/vitamin-d-1.jpg'],
    reviews: [
      {
        id: 'review-3',
        rating: 4,
        author: '박영희',
        content: '뼈 건강에 도움이 됩니다.',
        date: '2025-10-20',
      },
    ],
  },
}

export const MOCK_SEARCH_RESULTS = [
  {
    id: 'pill-1',
    name: 'Simvastatin 20mg',
    manufacturer: '삼성제약',
    form: '정제',
    color: '하얀색',
    shape: '타원형',
    imprint: 'S20',
    matchScore: 100,
  },
  {
    id: 'pill-2',
    name: 'Metformin 500mg',
    manufacturer: '한미약품',
    form: '정제',
    color: '흰색',
    shape: '둥근형',
    imprint: 'M500',
    matchScore: 85,
  },
  {
    id: 'pill-search-1',
    name: 'Simvastatin 40mg',
    manufacturer: '삼성제약',
    form: '정제',
    color: '분홍색',
    shape: '타원형',
    imprint: 'S40',
    matchScore: 80,
  },
]

export default { MOCK_PILL_DETAILS, MOCK_SEARCH_RESULTS }
