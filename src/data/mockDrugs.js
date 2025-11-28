/**
 * 약품명 검색 Mock 데이터
 * @description MFDS 검색 API 응답 형태를 단순화한 샘플
 */

export const MOCK_DRUG_SEARCH_RESULTS = [
  {
    itemSeq: '20000001',
    itemName: '타이레놀정 500mg',
    entpName: '한국얀센',
    itemImage: 'https://dummyimage.com/120x80/f3f4f6/111827.png&text=%F0%9F%92%8A',
    efcyQesitm: '해열 및 진통에 사용되는 아세트아미노펜 제제입니다.',
    useMethodQesitm: '성인은 4~6시간마다 1정씩, 1일 최대 3회 복용합니다.',
    atpnQesitm: '간 질환 환자는 복용 전 의사와 상담하세요.',
    intrcQesitm: '알코올과 병용 시 간 손상 위험이 증가합니다.',
    seQesitm: '드물게 발진, 소화불량, 어지러움이 나타날 수 있습니다.',
    depositMethodQesitm: '습기와 빛을 피해 실온(1~30℃)에서 보관하세요.',
    openDe: '20210101',
    updateDe: '20241001',
  },
  {
    itemSeq: '19876543',
    itemName: '아스피린장용정 100mg',
    entpName: '바이엘코리아',
    itemImage: 'https://dummyimage.com/120x80/e0f2fe/0f172a.png&text=ASA',
    efcyQesitm: '혈전 형성 억제 및 심혈관 질환 예방에 사용됩니다.',
    useMethodQesitm: '식후 충분한 물과 함께 1정 복용합니다.',
    atpnQesitm: '위장 장애가 있는 경우 주의가 필요합니다.',
    intrcQesitm: '와파린 등 항응고제와 병용 시 출혈 위험이 증가합니다.',
    seQesitm: '속쓰림, 멍, 코피 등 출혈 증상이 나타날 수 있습니다.',
    depositMethodQesitm: '습기가 적은 서늘한 곳에 보관하세요.',
    openDe: '20200201',
    updateDe: '20240615',
  },
  {
    itemSeq: '21004567',
    itemName: '레보설피리드정 25mg',
    entpName: '대웅제약',
    itemImage: '',
    efcyQesitm: '소화불량, 만성 위염에 따른 증상 개선에 사용됩니다.',
    useMethodQesitm: '성인은 1일 3회, 1회 1정 식전 복용합니다.',
    atpnQesitm: '파킨슨병 환자, 임부/수유부는 복용 전 전문의와 상담하세요.',
    intrcQesitm: '도파민 길항제와 병용 시 이상운동증이 악화될 수 있습니다.',
    seQesitm: '졸음, 어지러움, 근긴장이상 등이 보고되었습니다.',
    depositMethodQesitm: '밀폐 용기에 담아 실온에서 보관하세요.',
    openDe: '20230310',
    updateDe: '20241010',
  },
]

export default {
  MOCK_DRUG_SEARCH_RESULTS,
}
