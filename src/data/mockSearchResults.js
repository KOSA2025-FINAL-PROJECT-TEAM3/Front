/**
 * 검색 결과 Mock 데이터
 * @file mockSearchResults.js
 * @description 증상 검색, 의심 질환, 질병별 제약 조건용 Mock 데이터
 */

export const MOCK_SYMPTOM_SEARCH_RESULTS = [
  {
    id: 'symptom-1',
    name: '두통',
    relatedDiseases: [
      {
        id: 'disease-1',
        name: '편두통',
        probability: 85,
      },
      {
        id: 'disease-2',
        name: '고혈압',
        probability: 60,
      },
      {
        id: 'disease-3',
        name: '뇌종양',
        probability: 5,
      },
    ],
    recommendations: [
      '의사와 상담하세요',
      '혈압을 측정하세요',
      '증상 일기를 기록하세요',
    ],
  },
  {
    id: 'symptom-2',
    name: '어지러움',
    relatedDiseases: [
      {
        id: 'disease-4',
        name: '저혈압',
        probability: 70,
      },
      {
        id: 'disease-5',
        name: '빈혈',
        probability: 65,
      },
      {
        id: 'disease-2',
        name: '고혈압',
        probability: 40,
      },
    ],
    recommendations: [
      '충분한 물을 섭취하세요',
      '갑자기 일어나지 마세요',
      '혈액 검사를 받으세요',
    ],
  },
]

export const MOCK_SUSPECTED_DISEASE = {
  id: 'suspected-1',
  symptoms: ['두통', '어지러움', '구역질'],
  suspectedDiseases: [
    {
      id: 'disease-1',
      name: '편두통',
      probability: 82,
      description: '신경 질환으로 인한 반복적인 두통입니다.',
      severity: 'MODERATE',
      recommendations: [
        '신경과 의사 상담',
        '약물 치료 고려',
        '스트레스 관리',
        '규칙적인 수면',
      ],
      warningMedications: [
        'Simvastatin',
        'Metformin',
      ],
    },
    {
      id: 'disease-2',
      name: '고혈압',
      probability: 65,
      description: '혈압이 정상 범위보다 높은 상태입니다.',
      severity: 'MODERATE',
      recommendations: [
        '혈압 측정 (매일)',
        '염분 섭취 제한',
        '규칙적인 운동',
        '내과 방문',
      ],
      warningMedications: [
        'NSAID',
        '충혈 완화제',
      ],
    },
    {
      id: 'disease-4',
      name: '저혈압',
      probability: 55,
      description: '혈압이 정상 범위보다 낮은 상태입니다.',
      severity: 'MILD',
      recommendations: [
        '충분한 수분 섭취',
        '소금 섭취 증가',
        '천천히 움직이기',
        '내과 방문',
      ],
      warningMedications: [],
    },
  ],
  disclaimer: '이는 AI 기반의 예상 진단이며, 반드시 의사의 진료를 받으세요.',
  generatedAt: new Date().toISOString(),
}

export const MOCK_DISEASE_RESTRICTIONS = {
  'disease-1': {
    id: 'disease-1',
    name: '편두통',
    description: '신경 질환으로 인한 반복적인 두통입니다.',
    avoidFoods: [
      {
        name: '초콜릿',
        reason: '페닐에틸아민 함유로 혈관 확장 유발',
        severity: 'MEDIUM',
      },
      {
        name: '숙성 치즈',
        reason: '티라민 함유로 혈관 수축 후 확장',
        severity: 'MEDIUM',
      },
      {
        name: '질산염 함유 식품 (훈제, 가공육)',
        reason: '혈관 확장 유발',
        severity: 'HIGH',
      },
      {
        name: '카페인',
        reason: '과다 복용 시 두통 악화',
        severity: 'MEDIUM',
      },
      {
        name: '알코올 (특히 와인, 맥주)',
        reason: '혈관 확장 및 탈수 유발',
        severity: 'HIGH',
      },
    ],
    avoidMedications: [
      {
        name: 'Simvastatin',
        reason: '약물 상호작용 가능성',
        severity: 'LOW',
      },
    ],
    recommendedFoods: [
      {
        name: '오메가-3 풍부 음식 (연어, 고등어)',
        reason: '염증 감소',
      },
      {
        name: '마그네슘 풍부 음식 (녹색 채소, 견과류)',
        reason: '신경 안정 효과',
      },
      {
        name: '생강',
        reason: '항염 작용',
      },
    ],
    recommendedMedications: [
      {
        name: 'Triptan',
        reason: '편두통 치료 약',
      },
    ],
  },
  'disease-2': {
    id: 'disease-2',
    name: '고혈압',
    description: '혈압이 정상 범위보다 높은 상태입니다.',
    avoidFoods: [
      {
        name: '염분 많은 식품',
        reason: '혈압 상승',
        severity: 'HIGH',
      },
      {
        name: '알코올',
        reason: '혈압 상승 및 심장 부하 증가',
        severity: 'HIGH',
      },
      {
        name: '카페인',
        reason: '일시적 혈압 상승',
        severity: 'MEDIUM',
      },
    ],
    avoidMedications: [
      {
        name: 'NSAID',
        reason: '혈압 상승',
        severity: 'HIGH',
      },
      {
        name: '충혈 완화제',
        reason: '혈압 상승',
        severity: 'MEDIUM',
      },
    ],
    recommendedFoods: [
      {
        name: '칼륨 풍부 음식 (바나나, 포도)',
        reason: '혈압 조절',
      },
      {
        name: '저염 음식',
        reason: '혈압 관리',
      },
      {
        name: '등 푸른 생선',
        reason: 'EPA, DHA 함유로 심혈관 건강',
      },
    ],
    recommendedMedications: [
      {
        name: 'ACE 억제제',
        reason: '혈압 저하제',
      },
      {
        name: '칼슘 채널 차단제',
        reason: '혈압 저하제',
      },
    ],
  },
}

export default {
  MOCK_SYMPTOM_SEARCH_RESULTS,
  MOCK_SUSPECTED_DISEASE,
  MOCK_DISEASE_RESTRICTIONS,
}
