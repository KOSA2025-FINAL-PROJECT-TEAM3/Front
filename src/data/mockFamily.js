export const DEFAULT_FAMILY_GROUP = {
  id: 'family-group-1',
  name: '우리 가족',
  createdBy: {
    id: 'guardian-1',
    name: '김보호',
  },
  createdAt: '2025-11-01T08:00:00Z',
}

export const DEFAULT_FAMILY_MEMBERS = [
  {
    id: 'member-guardian',
    name: '김보호',
    email: 'guardian@amapill.dev',
    role: 'CAREGIVER',
    joinedAt: '2025-11-01T08:00:00Z',
    avatarColor: '#a5b4fc',
  },
  {
    id: 'member-senior-1',
    name: '김시니어',
    email: 'senior@amapill.dev',
    role: 'SENIOR',
    joinedAt: '2025-11-01T08:00:00Z',
    avatarColor: '#f9a8d4',
  },
  {
    id: 'member-senior-2',
    name: '박시니어',
    email: 'senior2@amapill.dev',
    role: 'SENIOR',
    joinedAt: '2025-11-15T08:00:00Z',
    avatarColor: '#fdba74',
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
    adherence: 72,
    medications: [
      { timeLabel: '아침 08:00', name: '혈압약 1정', statusLabel: '복용 완료' },
      { timeLabel: '점심 12:00', name: '당뇨약 1정', statusLabel: '대기 중' },
      { timeLabel: '저녁 20:00', name: '오메가3 1정', statusLabel: '예정' },
    ],
  },
  'member-senior-2': {
    adherence: 58,
    medications: [
      { timeLabel: '아침 09:00', name: '갑상선약 1정', statusLabel: '복용 완료' },
      { timeLabel: '저녁 21:00', name: '비타민 D 1정', statusLabel: '복용 완료' },
    ],
  },
  'member-guardian': {
    adherence: 95,
    medications: [
      { timeLabel: '아침 07:30', name: '종합비타민', statusLabel: '복용 완료' },
    ],
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
