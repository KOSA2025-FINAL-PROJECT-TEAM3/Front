export const DEFAULT_FAMILY_GROUP = {
  id: 'family-group-1',
  name: '사랑하는 우리 가족',
  createdBy: {
    id: 'caregiver-1',
    name: '김효신',
  },
  createdAt: '2025-10-28T14:00:00Z',
}

export const DEFAULT_FAMILY_MEMBERS = [
  {
    id: 'member-caregiver-1',
    name: '김효신',
    email: 'hyoshin.kim@amapill.dev',
    role: 'CAREGIVER',
    joinedAt: '2025-10-28T14:00:00Z',
    avatarColor: '#a5b4fc',
  },
  {
    id: 'member-senior-1',
    name: '김정숙',
    email: 'jeongsuk.kim@amapill.dev',
    role: 'SENIOR',
    joinedAt: '2025-10-28T14:05:00Z',
    avatarColor: '#f9a8d4',
  },
  {
    id: 'member-senior-2',
    name: '박철수',
    email: 'chulsoo.park@amapill.dev',
    role: 'SENIOR',
    joinedAt: '2025-11-02T18:30:00Z',
    avatarColor: '#fdba74',
  },
  {
    id: 'member-caregiver-2',
    name: '박지민',
    email: 'jimin.park@amapill.dev',
    role: 'CAREGIVER',
    joinedAt: '2025-11-05T11:20:00Z',
    avatarColor: '#818cf8',
  },
  {
    id: 'member-senior-3',
    name: '이은주',
    email: 'eunju.lee@amapill.dev',
    role: 'SENIOR',
    joinedAt: '2025-11-10T09:00:00Z',
    avatarColor: '#fca5a5',
  },
]

export const buildNewMember = ({ name, email, role }) => ({
  id: `member-${Date.now()}`,
  name,
  email,
  role,
  joinedAt: new Date().toISOString(),
  avatarColor: '#fef08a',
})

export const DEFAULT_MEMBER_DETAILS = {
  'member-senior-1': {
    adherence: 85,
    medications: [
      { timeLabel: '아침 08:00', name: '고혈압약 (노바스크 5mg)', statusLabel: '복용 완료' },
      { timeLabel: '점심 12:30', name: '고지혈증약 (리피토 10mg)', statusLabel: '대기 중' },
      { timeLabel: '저녁 19:00', name: '오메가3 (1000mg)', statusLabel: '예정' },
      { timeLabel: '취침 전 22:00', name: '마그네슘 (400mg)', statusLabel: '예정' },
    ],
  },
  'member-senior-2': {
    adherence: 76,
    medications: [
      { timeLabel: '아침 09:00', name: '관절염약 (쎄레브렉스 200mg)', statusLabel: '복용 완료' },
      { timeLabel: '아침 09:00', name: '칼슘 & 비타민D', statusLabel: '복용 완료' },
      { timeLabel: '저녁 20:00', name: '소화효소제', statusLabel: '놓침' },
    ],
  },
  'member-senior-3': {
    adherence: 65,
    medications: [
      { timeLabel: '아침 08:30', name: '당뇨약 (메트포르민 500mg)', statusLabel: '대기 중' },
      { timeLabel: '저녁 20:30', name: '혈액순환개선제 (징코민)', statusLabel: '예정' },
    ],
  },
  'member-caregiver-1': {
    adherence: 98,
    medications: [],
  },
  'member-caregiver-2': {
    adherence: 95,
    medications: [],
  },
}

const MEDICATION_TEMPLATES = [
  { timeLabel: '아침 08:00', name: '혈압약 1정' },
  { timeLabel: '점심 12:00', name: '영양제 1포' },
  { timeLabel: '저녁 20:00', name: '수면 유도제 1정' },
]

const STATUS_SEQUENCE = ['복용 완료', '대기 중', '예정']

export const buildMemberDetailSnapshot = (memberName = '구성원') => {
  const adherence = 65 + Math.floor(Math.random() * 25)
  const medications = MEDICATION_TEMPLATES.map((template, index) => ({
    ...template,
    statusLabel: STATUS_SEQUENCE[index % STATUS_SEQUENCE.length],
    name:
      index === 1
        ? `${memberName.slice(0, 1)}님 전용 ${template.name}`
        : template.name,
  }))
  return {
    adherence,
    medications,
  }
}
