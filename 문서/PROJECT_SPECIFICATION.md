# AMA...Pill - 가족 돌봄 중심 약 관리 플랫폼

## 📋 프로젝트 개요

### 프로젝트 명
**AMA...Pill (AMA...Pill)** - "약 먹을 시간이에요?"

### 팀 구성
- **팀원**: 3명
- **프로젝트 기간**: 2025년 11월 5일 ~ 12월 31일 (약 8주)
- **발표일**: 2025년 12월 31일
- **실제 개발 기간**: 약 7주 (발표 준비 제외)

### 프로젝트 목표
혼자 사시는 부모님의 **약 복용 관리**를 자녀가 원격으로 돌볼 수 있는 **가족 돌봄 네트워크** 플랫폼.
기존 개인용 약 관리 앱과 달리, **시니어(부모님) + 케어기버(자녀)** 양면 시장을 공략하는 차별화된 서비스입니다.

### 핵심 가치 제안
> "부모님이 약을 안 드셨어요!" - 떨어져 있어도 실시간으로 케어할 수 있습니다.

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: React (JavaScript + JSX) ⭐ **React Native 사용 금지**
- **번들러**: Vite
- **실시간 동기화**: Hocuspocus + TipTap (가족 간 데이터 공유)
- **상태 관리**: Zustand (전역) + React Query (서버 상태)
- **스타일링**: SCSS Modules + Tailwind CSS

### Backend
- **Language**: Java 21 LTS (2029년까지 지원, Virtual Threads, ZGC)
- **Framework**: Spring Boot 3.4.7 (안정 버전, 49개 버그 수정)
- **Cloud**: Spring Cloud 2024.0.2 (Moorgate, Spring Boot 3.4.x 호환)
- **보안**: Spring Security (JWT 인증)
- **AI 통합**: Spring AI (OCR, 약-음식 충돌 분석)
- **메시징**: Apache Kafka (이벤트 기반 알림 처리)
- **워크플로우 자동화**: n8n (알림 스케줄링)

### Database
- **관계형 DB**: MySQL / PostgreSQL (결정 필요)
- **캐싱/세션**: Redis
- **실시간 동기화**: Hocuspocus (WebSocket 기반)

### 외부 API 및 서비스
- **OCR**: Google Cloud Vision API (무료 한도 1,000건/월) / Tesseract.js (무료, 보조용)
  - ⚠️ Naver Clova OCR은 유료(기본 유지비 발생)로 제외
- **알림**: 카카오 알림톡 API (Phase 2)
- **공공 API**: 식약처 의약품안전나라 API (무료, 공공데이터포털)

---

## 🔥 핵심 차별화 기능 (참신한 기능!)

### 1. **가족 돌봄 네트워크** ⭐⭐⭐⭐⭐ (핵심 차별점!)

#### 현실적 문제
- 혼자 사시는 부모님이 약을 잘 안 드심
- 자녀가 챙겨드리고 싶지만 물리적으로 멀리 떨어짐
- 부모님은 앱 사용이 어려움
- **기존 앱은 모두 개인용, 가족 연동 없음**

#### 솔루션: 실시간 가족 케어 시스템
```
[시나리오]
1. 자녀가 부모님 계정에 원격으로 약 스케줄 등록
   (부모님은 복잡한 설정 불필요)

2. 부모님 웹앱에 TODO 리스트 형태로 표시:
   ┌──────────────────────────┐
   │ 오늘의 약 복용           │
   │                          │
   │ ☐ 아침 식후              │
   │   혈압약 (아모디핀) 1알   │
   │                          │
   │ ☐ 점심 식후              │
   │   당뇨약 (메트포르민) 1알 │
   │                          │
   │ ☐ 저녁 식후              │
   │   고지혈증약 (아토르바) 1알│
   └──────────────────────────┘

3. 부모님이 체크박스 클릭 → 복용 완료
   → Hocuspocus로 실시간 동기화

4. 자녀 앱에 즉시 알림:
   "어머니가 오후 2시 혈압약을 복용 완료했습니다 ✓"

5. 3시간 지나도 체크 안 하면:
   → 자녀에게 긴급 알림 발송
   "어머니가 점심 약을 아직 드시지 않았습니다!"
```

#### 기술 구현
```javascript
// Hocuspocus Provider로 실시간 동기화
const provider = new HocuspocusProvider({
  url: 'ws://your-server.com',
  name: 'family-group-{family_id}', // 가족 그룹별 독립 공간
});

// 부모님이 체크박스 클릭 시
const completeMedication = (medId) => {
  // 1. 로컬 상태 업데이트
  updateMedicationLog(medId, { completed: true, timestamp: now() });

  // 2. Hocuspocus가 자동으로 모든 가족 구성원에게 동기화

  // 3. Kafka 이벤트 발행 → 자녀에게 알림
  kafka.publish('medication.completed', {
    userId: parentId,
    medName: '혈압약',
    timestamp: now()
  });
};
```

#### 차별점
- ✅ **기존 앱 없음**: 약 관리 앱은 모두 개인용
- ✅ **Hocuspocus 활용**: 이미 사용 중인 기술 스택과 완벽 매치
- ✅ **양면 시장**: 시니어(사용자) + 자녀(케어기버) 동시 공략
- ✅ **실용성**: 실제 페인포인트 해결

---

### 2. **약-음식 충돌 실시간 경고** ⭐⭐⭐⭐⭐

#### 현실적 문제
- 와파린(혈액희석제) + 비타민K 음식 = 약효 감소
- 칼슘채널차단제 + 자몽 = 혈압 급강하 위험
- **환자들이 이런 상호작용을 전혀 모름**
- **기존 앱은 약-약 상호작용만 체크, 약-음식 충돌은 거의 없음!**

#### 솔루션: 식단 입력 시 자동 경고
```
[시나리오]
사용자: "점심에 시금치 나물 먹음" 입력

시스템:
⚠️ 주의 필요
현재 복용 중인 와파린과 상호작용 가능성이 있습니다.

📌 상세 정보:
- 시금치는 비타민K가 풍부합니다
- 비타민K는 혈액 응고를 촉진하여 와파린의 혈액 희석 효과를 감소시킬 수 있습니다
- 과량 섭취를 피하고, 섭취 시 약효 변화에 주의해주세요

💡 추천:
- 비타민K 함량이 낮은 대체 채소: 오이, 당근, 가지
```

#### 기술 구현 (구체적 단계)

**Step 1: 약-음식 상호작용 데이터베이스 구축**
```javascript
// 데이터베이스 스키마 (MySQL/PostgreSQL)
/*
CREATE TABLE drug_food_interactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  drug_name VARCHAR(255) NOT NULL,
  drug_ingredient VARCHAR(255),       -- 주성분 (예: 와파린)
  food_name VARCHAR(255) NOT NULL,    -- 피해야 할 음식
  food_category VARCHAR(100),         -- 음식 카테고리
  conflict_ingredient VARCHAR(255),   -- 충돌 성분 (예: 비타민K)
  reason TEXT,                        -- 상호작용 이유
  severity ENUM('높음', '중간', '낮음'),
  alternatives TEXT,                  -- 대체 음식 (JSON)
  source VARCHAR(500),                -- 출처 (식약처, 병원 등)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drug_name ON drug_food_interactions(drug_name);
CREATE INDEX idx_food_name ON drug_food_interactions(food_name);
*/

// 초기 데이터 (50~100개 주요 약물 상호작용)
const drugFoodInteractionsData = [
  // 항응고제
  {
    drugName: '와파린',
    drugIngredient: 'Warfarin',
    foods: ['시금치', '청경채', '케일', '브로콜리', '파슬리', '깻잎', '미역', '김'],
    conflictIngredient: '비타민K',
    reason: '비타민K는 혈액 응고를 촉진하여 와파린의 항응고 효과를 감소시킬 수 있습니다. 과량 섭취 시 혈전 위험이 증가할 수 있습니다.',
    severity: '높음',
    alternatives: ['오이', '당근', '가지', '양파', '버섯'],
    source: '식약처, 삼성서울병원'
  },

  // 혈압약 (칼슘채널차단제)
  {
    drugName: '암로디핀',
    drugIngredient: 'Amlodipine',
    foods: ['자몽', '자몽주스'],
    conflictIngredient: '푸라노쿠마린',
    reason: '자몽의 푸라노쿠마린 성분이 약물 대사 효소를 억제하여 혈중 약물 농도가 급증하고, 혈압이 과도하게 떨어져 어지럼증, 실신 위험이 있습니다.',
    severity: '높음',
    alternatives: ['오렌지', '귤', '레몬', '사과주스'],
    source: 'FDA, 식약처'
  },

  // 갑상선 호르몬제
  {
    drugName: '신지로이드',
    drugIngredient: 'Levothyroxine',
    foods: ['두유', '콩', '호두', '커피'],
    conflictIngredient: '이소플라본, 카페인',
    reason: '콩의 이소플라본과 커피의 카페인이 약물 흡수를 방해하여 갑상선 호르몬 수치가 불안정해질 수 있습니다.',
    severity: '중간',
    alternatives: ['우유', '아몬드유', '물'],
    source: '식약처'
  },

  // 항생제
  {
    drugName: '테트라사이클린',
    drugIngredient: 'Tetracycline',
    foods: ['우유', '치즈', '요구르트', '칼슘보충제'],
    conflictIngredient: '칼슘',
    reason: '칼슘이 항생제와 결합하여 흡수를 방해하고 약효가 크게 감소합니다.',
    severity: '높음',
    alternatives: ['물', '무가당 음료'],
    source: '식약처'
  },

  // 당뇨약
  {
    drugName: '메트포르민',
    drugIngredient: 'Metformin',
    foods: ['술', '소주', '맥주', '와인'],
    conflictIngredient: '알코올',
    reason: '알코올과 함께 복용 시 저혈당 및 젖산산증 위험이 증가합니다.',
    severity: '높음',
    alternatives: ['물', '무가당 음료'],
    source: '식약처, 대한당뇨병학회'
  },

  // 소염진통제
  {
    drugName: '아스피린',
    drugIngredient: 'Aspirin',
    foods: ['술', '커피'],
    conflictIngredient: '알코올, 카페인',
    reason: '알코올과 카페인이 위장 자극을 증가시켜 위염, 위궤양 위험이 높아집니다.',
    severity: '중간',
    alternatives: ['물', '우유'],
    source: '식약처'
  },

  // ... 총 50~100개 데이터
];
```

**Step 2: 식단 입력 UI + 실시간 경고 시스템**
```javascript
// 식단 입력 컴포넌트
const MealInputForm = () => {
  const [mealType, setMealType] = useState('breakfast'); // breakfast, lunch, dinner, snack
  const [foodInput, setFoodInput] = useState('');
  const [warnings, setWarnings] = useState([]);
  const { userMedications } = useUser(); // 현재 사용자의 복용 약물

  // 실시간 경고 체크 (입력할 때마다)
  const handleFoodInputChange = async (value) => {
    setFoodInput(value);

    if (value.length >= 2) {
      // 디바운스 후 체크
      const results = await checkFoodInteractionRealtime(value, userMedications);
      setWarnings(results);
    } else {
      setWarnings([]);
    }
  };

  // 식단 등록
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 최종 경고 체크
    const finalWarnings = await checkFoodInteraction(foodInput, userMedications);

    if (finalWarnings.length > 0) {
      // 경고가 있으면 확인 다이얼로그
      const confirmed = await showWarningDialog(finalWarnings);
      if (!confirmed) return;
    }

    // 2. 식단 저장
    await saveMeal({
      userId: currentUser.id,
      mealType,
      foodName: foodInput,
      recordedAt: new Date(),
      warnings: finalWarnings // 경고 이력도 저장
    });

    // 3. 가족에게 알림 (심각한 경고인 경우)
    if (finalWarnings.some(w => w.severity === '높음')) {
      await notifyFamily({
        userId: currentUser.id,
        type: 'DRUG_FOOD_WARNING',
        message: `${currentUser.name}님이 복용 중인 약과 상호작용 가능한 음식을 섭취하셨습니다.`,
        details: finalWarnings
      });
    }

    setFoodInput('');
    setWarnings([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={mealType} onChange={e => setMealType(e.target.value)}>
        <option value="breakfast">아침</option>
        <option value="lunch">점심</option>
        <option value="dinner">저녁</option>
        <option value="snack">간식</option>
      </select>

      <input
        type="text"
        value={foodInput}
        onChange={e => handleFoodInputChange(e.target.value)}
        placeholder="먹은 음식 입력 (예: 시금치 나물)"
      />

      {/* 실시간 경고 표시 */}
      {warnings.length > 0 && (
        <div className="warnings-container">
          {warnings.map((warning, idx) => (
            <Warning key={idx} data={warning} />
          ))}
        </div>
      )}

      <button type="submit">등록</button>
    </form>
  );
};
```

**Step 3: 경고 체크 로직 (프론트엔드 + 백엔드)**
```javascript
// Frontend: 빠른 로컬 체크 (자주 사용하는 음식만)
const checkFoodInteractionRealtime = async (foodInput, userMedications) => {
  // 1. 로컬 캐시에서 먼저 체크 (빠른 응답)
  const localWarnings = checkLocalInteractions(foodInput, userMedications);

  // 2. 백엔드에서 전체 데이터베이스 검색
  const serverWarnings = await fetch('/api/interactions/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      foodName: foodInput,
      medications: userMedications.map(m => m.name)
    })
  }).then(res => res.json());

  return [...new Set([...localWarnings, ...serverWarnings])]; // 중복 제거
};

// Backend (Spring Boot): 데이터베이스 검색
@RestController
@RequestMapping("/api/interactions")
public class DrugFoodInteractionController {

    @Autowired
    private DrugFoodInteractionRepository repository;

    @PostMapping("/check")
    public List<InteractionWarning> checkInteractions(
        @RequestBody InteractionCheckRequest request
    ) {
        List<InteractionWarning> warnings = new ArrayList<>();

        for (String medication : request.getMedications()) {
            // 약명으로 상호작용 검색
            List<DrugFoodInteraction> interactions = repository
                .findByDrugNameContainingAndFoodNameContaining(
                    medication,
                    request.getFoodName()
                );

            for (DrugFoodInteraction interaction : interactions) {
                warnings.add(InteractionWarning.builder()
                    .medication(medication)
                    .food(interaction.getFoodName())
                    .ingredient(interaction.getConflictIngredient())
                    .reason(interaction.getReason())
                    .severity(interaction.getSeverity())
                    .alternatives(parseAlternatives(interaction.getAlternatives()))
                    .source(interaction.getSource())
                    .build());
            }
        }

        return warnings;
    }

    // 주성분으로도 검색 (동일 성분 다른 상품명 대응)
    @GetMapping("/by-ingredient/{ingredient}")
    public List<DrugFoodInteraction> getByIngredient(
        @PathVariable String ingredient
    ) {
        return repository.findByDrugIngredientContaining(ingredient);
    }
}
```

**Step 4: 경고 UI 컴포넌트 (사용자 친화적)**
```javascript
const Warning = ({ data }) => {
  const severityColors = {
    '높음': '#ff4d4d',
    '중간': '#ffa500',
    '낮음': '#ffeb3b'
  };

  return (
    <div
      className="warning-card"
      style={{ borderLeft: `4px solid ${severityColors[data.severity]}` }}
    >
      <div className="warning-header">
        <span className="severity-badge" style={{ background: severityColors[data.severity] }}>
          {data.severity === '높음' ? '🚨' : data.severity === '중간' ? '⚠️' : '💡'}
          {data.severity} 위험
        </span>
        <h4>{data.medication} ↔️ {data.food}</h4>
      </div>

      <div className="warning-body">
        <p className="conflict-ingredient">
          충돌 성분: <strong>{data.ingredient}</strong>
        </p>
        <p className="reason">{data.reason}</p>

        {data.alternatives && data.alternatives.length > 0 && (
          <div className="alternatives">
            <strong>💡 대체 가능한 음식:</strong>
            <ul>
              {data.alternatives.map((alt, idx) => (
                <li key={idx}>{alt}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="source">출처: {data.source}</p>
      </div>

      <div className="warning-actions">
        <button onClick={() => learnMore(data)}>자세히 보기</button>
        <button onClick={() => contactDoctor(data)}>의사와 상담</button>
      </div>
    </div>
  );
};
```

**Step 5: Kafka 이벤트로 가족 알림**
```javascript
// 심각한 경고 발생 시 자동으로 가족에게 알림
@Service
public class DrugFoodWarningService {

    @Autowired
    private KafkaTemplate<String, WarningEvent> kafkaTemplate;

    public void notifyFamilyOnSevereWarning(
        User user,
        List<InteractionWarning> warnings
    ) {
        // 높음 심각도 경고만 필터링
        List<InteractionWarning> severeWarnings = warnings.stream()
            .filter(w -> "높음".equals(w.getSeverity()))
            .collect(Collectors.toList());

        if (!severeWarnings.isEmpty()) {
            // Kafka 이벤트 발행
            WarningEvent event = WarningEvent.builder()
                .userId(user.getId())
                .userName(user.getName())
                .type("DRUG_FOOD_WARNING")
                .warnings(severeWarnings)
                .timestamp(LocalDateTime.now())
                .build();

            kafkaTemplate.send("drug-food-warnings", event);

            // 가족 구성원에게 웹 푸시 알림
            notifyFamilyMembers(user.getFamilyGroupId(), event);
        }
    }
}
```

#### 데이터 출처 및 수집 방법
- **식약처 공공 데이터**: 의약품 상호작용 정보
- **병원 식이요법 자료**: 약물-식품 상호작용 데이터베이스
  - ⚠️ 주의: 병원 웹사이트는 접근 제한이 있을 수 있으므로, 공개된 PDF 자료나 학술 논문을 참고
  - 대한약사회, 식약처 안전성 정보 활용 권장
- **의학 학술 자료**: PubMed, 대한약학회 논문
- **초기 구축**: 50~100개 주요 약물 상호작용만 구축해도 충분
  - 우선순위: 항응고제, 혈압약, 당뇨약, 항생제, 갑상선약 등 만성질환 약물

#### 차별점
- ✅ **기존 앱 없음**: 약-약 상호작용만 있고 약-음식은 거의 없음
- ✅ **구현 간단**: AI 불필요, 룰 베이스로 1주 내 구현 가능
- ✅ **실용적**: 실제 건강 위험 방지

---

### 3. **약봉지 OCR → 원터치 자동 등록** ⭐⭐⭐⭐

#### 현실적 문제
- 약 정보 수동 입력 너무 귀찮음
- 복잡한 용법 (1일 3회, 식후 30분) 헷갈림
- **기존 앱은 수동 입력만 가능**

#### 솔루션
```
[시나리오]
1. 약국에서 받은 약봉지 사진 촬영 📸

2. OCR 자동 인식:
   ┌─────────────────────────┐
   │ 인식된 정보:            │
   │ • 약명: 아스피린 100mg   │
   │ • 용법: 1일 1회         │
   │ • 시간: 아침 식후 30분   │
   │ • 처방일수: 30일        │
   │ • 총 개수: 30알         │
   └─────────────────────────┘

3. 사용자는 "확인" 버튼만 클릭
   → 자동으로 30일간 스케줄 생성
   → 재고 관리 시작

4. 매일 아침 9시에 자동 알림
```

#### 기술 구현 (구체적 단계)

**Step 1: 이미지 전처리 (정확도 향상)**
```javascript
// 1. 이미지 품질 개선
const preprocessImage = async (imageFile) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = await loadImage(imageFile);

  // 크기 정규화 (OCR 정확도 향상)
  const scale = Math.min(1920 / img.width, 1080 / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  // 그레이스케일 변환 (텍스트 인식률 향상)
  ctx.filter = 'grayscale(100%) contrast(1.2)';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.95);
};
```

**Step 2: OCR 수행 (Google Cloud Vision API)**
```javascript
// Google Cloud Vision API 호출
const performOCR = async (imageBase64) => {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: imageBase64.split(',')[1] },
        features: [{ type: 'TEXT_DETECTION' }]
      }]
    })
  });

  const result = await response.json();
  return result.responses[0].fullTextAnnotation.text;
};

// Fallback: Tesseract.js (오프라인 또는 무료 한도 초과 시)
const performOCRFallback = async (imageFile) => {
  const { data: { text } } = await Tesseract.recognize(imageFile, 'kor+eng', {
    logger: m => console.log(m) // 진행률 표시
  });
  return text;
};
```

**Step 3: 약 정보 추출 (정규식 + 패턴 매칭)**
```javascript
const extractMedicationInfo = (ocrText) => {
  // 1. 약명 추출 (다양한 패턴 대응)
  const extractMedName = (text) => {
    // 패턴 1: "[약품명] 몇mg"
    const pattern1 = /【(.+?)】\s*(\d+(?:\.\d+)?)\s*(mg|mcg|g)/;
    // 패턴 2: "약명: OOO"
    const pattern2 = /약명[:：]\s*(.+?)(?:\s+\d+|\n)/;
    // 패턴 3: 첫 줄에 큰 글씨로 된 약명
    const pattern3 = /^(.+?)\s+\d+(?:mg|mcg)/m;

    const match = text.match(pattern1) || text.match(pattern2) || text.match(pattern3);
    return match ? match[1].trim() : null;
  };

  // 2. 용법 추출
  const extractDosage = (text) => {
    const patterns = [
      /1일\s*(\d+)회/,
      /하루\s*(\d+)번/,
      /(\d+)회\/일/
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return { frequency: parseInt(match[1]), unit: '회/일' };
    }
    return null;
  };

  // 3. 복용 시간 추출
  const extractTiming = (text) => {
    const timingMap = {
      '아침 식후': ['아침 식후', '조식후', '아침식후'],
      '점심 식후': ['점심 식후', '중식후', '점심식후'],
      '저녁 식후': ['저녁 식후', '석식후', '저녁식후'],
      '식후 30분': ['식후 30분', '식후30분'],
      '식전': ['식전']
    };

    for (const [key, patterns] of Object.entries(timingMap)) {
      if (patterns.some(p => text.includes(p))) return key;
    }
    return '식후'; // 기본값
  };

  // 4. 처방 일수 및 총 개수 추출
  const extractDaysAndQuantity = (text) => {
    const daysMatch = text.match(/(\d+)일[분分]/);
    const quantityMatch = text.match(/총\s*(\d+)\s*[개정알]/);

    return {
      days: daysMatch ? parseInt(daysMatch[1]) : null,
      quantity: quantityMatch ? parseInt(quantityMatch[1]) : null
    };
  };

  // 통합 추출
  return {
    name: extractMedName(ocrText),
    dosage: extractDosage(ocrText),
    timing: extractTiming(ocrText),
    ...extractDaysAndQuantity(ocrText)
  };
};
```

**Step 4: 식약처 API로 약 상세 정보 조회**
```javascript
const getMedicationDetails = async (medName) => {
  try {
    const apiUrl = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';
    const response = await fetch(`${apiUrl}?serviceKey=${SERVICE_KEY}&itemName=${encodeURIComponent(medName)}`);
    const data = await response.json();

    if (data.body.totalCount > 0) {
      const item = data.body.items[0];
      return {
        ingredient: item.mainIngredient,        // 주성분
        efficacy: item.efcyQesitm,             // 효능
        usage: item.useMethodQesitm,           // 사용법
        precautions: item.atpnQesitm,          // 주의사항
        sideEffects: item.seQesitm,            // 부작용
        manufacturer: item.entpName             // 제조사
      };
    }
  } catch (error) {
    console.error('식약처 API 조회 실패:', error);
    return null;
  }
};
```

**Step 5: 사용자 확인 및 자동 스케줄 생성**
```javascript
const autoRegisterMedication = async (imageFile) => {
  // 1. 전처리
  const processedImage = await preprocessImage(imageFile);

  // 2. OCR (Google Vision → Tesseract fallback)
  let ocrText;
  try {
    ocrText = await performOCR(processedImage);
  } catch (error) {
    console.warn('Google Vision 실패, Tesseract.js로 fallback');
    ocrText = await performOCRFallback(imageFile);
  }

  // 3. 정보 추출
  const extracted = extractMedicationInfo(ocrText);

  // 4. 식약처 API로 상세 정보
  const details = await getMedicationDetails(extracted.name);

  // 5. 사용자 확인 UI 표시
  const confirmed = await showConfirmationDialog({
    ...extracted,
    ...details,
    rawText: ocrText // 디버깅용
  });

  if (confirmed) {
    // 6. 자동 스케줄 생성 (Kafka 이벤트 발행)
    await createMedicationSchedule({
      userId: currentUser.id,
      medication: confirmed,
      schedules: generateSchedules(confirmed.dosage, confirmed.timing, confirmed.days)
    });

    // 7. 재고 관리 시작
    await initializeInventory({
      medicationId: confirmed.id,
      totalQuantity: confirmed.quantity,
      remainingQuantity: confirmed.quantity,
      expiryDate: confirmed.expiryDate
    });
  }
};

// 스케줄 자동 생성 헬퍼
const generateSchedules = (dosage, timing, days) => {
  const schedules = [];
  const timingMap = {
    '아침 식후': '09:00',
    '점심 식후': '13:00',
    '저녁 식후': '19:00'
  };

  for (let day = 0; day < days; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);

    // dosage.frequency만큼 반복
    for (let i = 0; i < dosage.frequency; i++) {
      schedules.push({
        date: date.toISOString().split('T')[0],
        time: timingMap[timing] || '09:00',
        completed: false
      });
    }
  }

  return schedules;
};
```

#### 사용 API 및 비용
- **Google Cloud Vision API**
  - 무료 한도: 1,000건/월
  - 이후: $1.50/1,000건
  - 한글 인식률: 95%+
  - [신청 방법](https://cloud.google.com/vision/docs/setup)

- **Tesseract.js** (Fallback용)
  - 완전 무료
  - 브라우저에서 실행
  - 한글 인식률: 80%
  - 느린 속도 (3-5초)

- **식약처 의약품안전나라 API** (약 정보 조회)
  - 완전 무료
  - 공공데이터포털에서 신청 (승인 20-30분)
  - [신청 링크](https://www.data.go.kr/data/15075163/openapi.do)

#### 차별점
- ✅ **편의성 극대화**: 사진 한 장으로 모든 정보 자동 입력
- ✅ **실버 친화**: 복잡한 입력 과정 제거

---

### 4. **알약 역검색 - "이게 무슨 약이지?"** ⭐⭐⭐⭐

#### 현실적 문제
- 약통에서 약이 쏟아졌을 때 구분 못함
- 여러 약이 섞여있을 때 뭐가 뭔지 모름

#### 솔루션
```
[시나리오]
1. 알약 사진 촬영 또는 특징 입력
   - 색상: 흰색
   - 모양: 원형
   - 각인: "A100"

2. 식약처 "의약품 식별정보" API 호출

3. 결과 표시:
   ┌─────────────────────────┐
   │ 🔍 검색 결과            │
   │                         │
   │ 약명: 아스피린 100mg     │
   │ 제조사: ○○제약         │
   │ 효능: 해열, 진통, 소염   │
   │                         │
   │ ⚠️ 주의사항:            │
   │ 공복 복용 시 위장 자극   │
   └─────────────────────────┘
```

#### 기술 구현 (구체적 단계)

**Step 1: UI - 알약 특징 입력 폼**
```javascript
// 알약 특징 입력 컴포넌트
const PillSearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    color: '',      // 색상
    shape: '',      // 모양
    imprint: '',    // 앞면 각인
    imprintBack: '' // 뒷면 각인
  });

  // 색상 옵션 (식약처 표준)
  const colorOptions = [
    '하양', '노랑', '주황', '분홍', '빨강', '갈색',
    '연두', '초록', '청록', '파랑', '남색', '자주', '보라',
    '회색', '검정', '투명'
  ];

  // 모양 옵션 (식약처 표준)
  const shapeOptions = [
    '원형', '타원형', '장방형', '반원형', '삼각형',
    '사각형', '마름모형', '오각형', '육각형', '팔각형',
    '기타'
  ];

  return (
    <form onSubmit={handleSearch}>
      <select
        value={searchParams.color}
        onChange={e => setSearchParams({...searchParams, color: e.target.value})}
      >
        <option value="">색상 선택</option>
        {colorOptions.map(color => <option key={color} value={color}>{color}</option>)}
      </select>

      <select
        value={searchParams.shape}
        onChange={e => setSearchParams({...searchParams, shape: e.target.value})}
      >
        <option value="">모양 선택</option>
        {shapeOptions.map(shape => <option key={shape} value={shape}>{shape}</option>)}
      </select>

      <input
        type="text"
        placeholder="앞면 각인 (예: A100)"
        value={searchParams.imprint}
        onChange={e => setSearchParams({...searchParams, imprint: e.target.value})}
      />

      <input
        type="text"
        placeholder="뒷면 각인 (선택)"
        value={searchParams.imprintBack}
        onChange={e => setSearchParams({...searchParams, imprintBack: e.target.value})}
      />

      <button type="submit">검색</button>
    </form>
  );
};
```

**Step 2: 식약처 API 호출 (의약품 낱알식별 정보)**
```javascript
// 식약처 의약품 낱알식별 정보 API
const searchPillByAppearance = async (color, shape, imprint, imprintBack) => {
  const apiUrl = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

  // 파라미터 매핑 (한글 → API 코드)
  const colorMap = {
    '하양': '하양', '노랑': '노랑', '주황': '주황', '분홍': '분홍',
    '빨강': '빨강', '갈색': '갈색', '연두': '연두', '초록': '초록'
    // ... 전체 매핑
  };

  const shapeMap = {
    '원형': '원형', '타원형': '타원형', '장방형': '장방형'
    // ... 전체 매핑
  };

  const params = new URLSearchParams({
    serviceKey: DRUG_API_KEY,
    type: 'json',
    numOfRows: 100
  });

  // 선택적 파라미터 추가
  if (color) params.append('drugShape', shapeMap[shape] || shape);
  if (shape) params.append('drugColor', colorMap[color] || color);
  if (imprint) params.append('printFront', imprint);
  if (imprintBack) params.append('printBack', imprintBack);

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    const data = await response.json();

    if (data.body && data.body.totalCount > 0) {
      return data.body.items.map(item => ({
        itemSeq: item.itemSeq,              // 품목기준코드
        itemName: item.itemName,            // 약품명
        entpName: item.entpName,            // 제조사
        itemImage: item.itemImage,          // 약품 이미지
        chart: item.chart,                  // 분류
        itemPermitDate: item.itemPermitDate,// 허가일자
        className: item.className,          // 효능분류
        etcOtcName: item.etcOtcName,       // 전문/일반
        // 식별 정보
        drugShape: item.drugShape,          // 모양
        colorClass1: item.colorClass1,      // 색상(앞)
        colorClass2: item.colorClass2,      // 색상(뒤)
        printFront: item.printFront,        // 앞면 각인
        printBack: item.printBack,          // 뒷면 각인
        lengLong: item.lengLong,            // 크기(장축)
        lengShort: item.lengShort,          // 크기(단축)
        thick: item.thick                   // 두께
      }));
    }

    return [];
  } catch (error) {
    console.error('식약처 API 조회 실패:', error);
    throw error;
  }
};
```

**Step 3: 검색 결과 표시 + 추가 정보 조회**
```javascript
const PillSearchResult = ({ results }) => {
  const [selectedPill, setSelectedPill] = useState(null);
  const [detailedInfo, setDetailedInfo] = useState(null);

  // 선택한 약의 상세 정보 조회
  const fetchDetailedInfo = async (itemSeq) => {
    const apiUrl = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';
    const response = await fetch(`${apiUrl}?serviceKey=${DRUG_API_KEY}&itemSeq=${itemSeq}`);
    const data = await response.json();

    if (data.body.items.length > 0) {
      const item = data.body.items[0];
      setDetailedInfo({
        efficacy: item.efcyQesitm,          // 효능효과
        usage: item.useMethodQesitm,        // 사용법
        precautions: item.atpnWarnQesitm,   // 경고
        atpnQesitm: item.atpnQesitm,       // 주의사항
        intrcQesitm: item.intrcQesitm,     // 상호작용
        seQesitm: item.seQesitm,           // 부작용
        depositMethodQesitm: item.depositMethodQesitm // 보관법
      });
    }
  };

  return (
    <div className="pill-search-results">
      <h3>검색 결과: {results.length}건</h3>

      {results.map(pill => (
        <div
          key={pill.itemSeq}
          className="pill-card"
          onClick={() => {
            setSelectedPill(pill);
            fetchDetailedInfo(pill.itemSeq);
          }}
        >
          {pill.itemImage && <img src={pill.itemImage} alt={pill.itemName} />}

          <div className="pill-info">
            <h4>{pill.itemName}</h4>
            <p>제조사: {pill.entpName}</p>
            <p>분류: {pill.className}</p>
            <p>전문/일반: {pill.etcOtcName}</p>

            <div className="pill-identification">
              <span>모양: {pill.drugShape}</span>
              <span>색상: {pill.colorClass1}</span>
              <span>앞면 각인: {pill.printFront}</span>
              {pill.printBack && <span>뒷면 각인: {pill.printBack}</span>}
            </div>
          </div>
        </div>
      ))}

      {/* 상세 정보 모달 */}
      {selectedPill && detailedInfo && (
        <div className="pill-detail-modal">
          <h2>{selectedPill.itemName}</h2>

          <section>
            <h3>🎯 효능·효과</h3>
            <p>{detailedInfo.efficacy}</p>
          </section>

          <section>
            <h3>💊 사용법</h3>
            <p>{detailedInfo.usage}</p>
          </section>

          <section>
            <h3>⚠️ 주의사항</h3>
            <p>{detailedInfo.atpnQesitm}</p>
          </section>

          <section>
            <h3>🔄 약물 상호작용</h3>
            <p>{detailedInfo.intrcQesitm}</p>
          </section>

          <section>
            <h3>🩺 부작용</h3>
            <p>{detailedInfo.seQesitm}</p>
          </section>

          <section>
            <h3>📦 보관법</h3>
            <p>{detailedInfo.depositMethodQesitm}</p>
          </section>

          <button onClick={() => handleAddToMyMedications(selectedPill)}>
            내 약 목록에 추가
          </button>
        </div>
      )}
    </div>
  );
};

// 내 약 목록에 추가
const handleAddToMyMedications = async (pill) => {
  await createMedication({
    userId: currentUser.id,
    name: pill.itemName,
    manufacturer: pill.entpName,
    itemSeq: pill.itemSeq, // 식약처 코드 저장
    imageUrl: pill.itemImage
  });

  alert(`${pill.itemName}이(가) 내 약 목록에 추가되었습니다.`);
};
```

**Step 4: (선택적) 이미지 기반 검색 - AI 색상/모양 추출**
```javascript
// 향후 확장: 알약 사진 찍으면 자동으로 색상/모양 감지
const extractPillFeatures = async (imageFile) => {
  // Google Cloud Vision API로 색상 추출
  const visionResult = await analyzeImage(imageFile);
  const dominantColor = visionResult.imagePropertiesAnnotation.dominantColors.colors[0];

  // 색상 매핑 (RGB → 한글 색상명)
  const colorName = rgbToKoreanColor(dominantColor.color);

  // 간단한 형태 분석 (원형 vs 타원형 등)
  // Canvas API로 윤곽선 분석
  const shape = await detectShape(imageFile);

  return {
    color: colorName,
    shape: shape
  };
};
```

#### 데이터 출처
- **식약처 공공데이터**: https://www.data.go.kr/data/15075163/fileData.do
- 약 10만건 데이터 (무료)

#### 차별점
- ✅ **실생활 페인포인트 해결**
- ✅ **구현 간단**: API 호출만

---

### 5. **복약 순응도 리포트** (의료진 공유용) ⭐⭐⭐

#### 현실적 문제
- 병원 가면 의사: "약 잘 드셨어요?"
- 환자: 기억 안 남 → "네 잘 먹었어요" (거짓)
- 실제로는 절반만 복용 → 치료 효과 없음
- 의사는 "약이 안 맞나?" vs "약을 안 먹나?" 판단 못함

#### 솔루션: 의료진 제출용 리포트
```
[기능]
1. 지난 30일간 복약 이력 자동 집계

2. PDF 리포트 생성:
   ┌─────────────────────────────┐
   │ 복약 순응도 리포트           │
   │ 기간: 2025-10-01 ~ 10-31    │
   │                             │
   │ 📊 전체 순응도: 87%         │
   │                             │
   │ 약물별 상세:                │
   │ • 혈압약 (아모디핀)          │
   │   - 순응도: 95% (2일 누락)  │
   │   - 누락일: 10/15, 10/23    │
   │                             │
   │ • 당뇨약 (메트포르민)        │
   │   - 순응도: 80% (6일 누락)  │
   │   - 누락일: 10/3, 10/7...   │
   │                             │
   │ 📈 주간별 트렌드 그래프      │
   └─────────────────────────────┘

3. "PDF 다운로드" → 진료 시 의사에게 제출
```

#### 기술 구현 (구체적 단계)

**Step 1: 복약 데이터 집계 (Backend)**
```java
@Service
public class AdherenceReportService {

    @Autowired
    private MedicationLogRepository logRepository;

    public AdherenceReport generateReport(Long userId, LocalDate startDate, LocalDate endDate) {
        // 1. 해당 기간의 모든 복약 로그 조회
        List<MedicationLog> logs = logRepository
            .findByUserIdAndScheduledTimeBetween(userId, startDate.atStartOfDay(), endDate.atTime(23, 59));

        // 2. 약물별 그룹화
        Map<Medication, List<MedicationLog>> logsByMed = logs.stream()
            .collect(Collectors.groupingBy(MedicationLog::getMedication));

        // 3. 약물별 순응도 계산
        List<MedicationAdherence> adherenceList = new ArrayList<>();

        for (Map.Entry<Medication, List<MedicationLog>> entry : logsByMed.entrySet()) {
            Medication med = entry.getKey();
            List<MedicationLog> medLogs = entry.getValue();

            // 전체 복용 예정 횟수
            long totalExpected = medLogs.size();

            // 실제 복용 횟수
            long completedCount = medLogs.stream()
                .filter(MedicationLog::isCompleted)
                .count();

            // 순응도 계산
            double adherenceRate = totalExpected > 0
                ? (completedCount * 100.0 / totalExpected)
                : 0;

            // 누락일 목록
            List<LocalDate> missedDates = medLogs.stream()
                .filter(log -> !log.isCompleted())
                .map(log -> log.getScheduledTime().toLocalDate())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

            adherenceList.add(MedicationAdherence.builder()
                .medication(med)
                .totalExpected(totalExpected)
                .completedCount(completedCount)
                .missedCount(totalExpected - completedCount)
                .adherenceRate(adherenceRate)
                .missedDates(missedDates)
                .build());
        }

        // 4. 전체 순응도 계산
        double overallAdherence = calculateOverallAdherence(adherenceList);

        // 5. 주간별 트렌드 계산
        List<WeeklyTrend> weeklyTrends = calculateWeeklyTrends(logs, startDate, endDate);

        return AdherenceReport.builder()
            .userId(userId)
            .startDate(startDate)
            .endDate(endDate)
            .overallAdherence(overallAdherence)
            .medicationAdherences(adherenceList)
            .weeklyTrends(weeklyTrends)
            .generatedAt(LocalDateTime.now())
            .build();
    }

    // 전체 순응도 계산
    private double calculateOverallAdherence(List<MedicationAdherence> adherences) {
        if (adherences.isEmpty()) return 0;

        double totalCompleted = adherences.stream()
            .mapToDouble(MedicationAdherence::getCompletedCount)
            .sum();

        double totalExpected = adherences.stream()
            .mapToDouble(MedicationAdherence::getTotalExpected)
            .sum();

        return totalExpected > 0 ? (totalCompleted * 100.0 / totalExpected) : 0;
    }

    // 주간별 트렌드 계산 (주차별 순응도)
    private List<WeeklyTrend> calculateWeeklyTrends(
        List<MedicationLog> logs,
        LocalDate startDate,
        LocalDate endDate
    ) {
        List<WeeklyTrend> trends = new ArrayList<>();

        LocalDate weekStart = startDate;
        while (weekStart.isBefore(endDate)) {
            LocalDate weekEnd = weekStart.plusDays(6);
            if (weekEnd.isAfter(endDate)) weekEnd = endDate;

            LocalDate finalWeekEnd = weekEnd;
            List<MedicationLog> weekLogs = logs.stream()
                .filter(log -> {
                    LocalDate logDate = log.getScheduledTime().toLocalDate();
                    return !logDate.isBefore(weekStart) && !logDate.isAfter(finalWeekEnd);
                })
                .collect(Collectors.toList());

            long weekTotal = weekLogs.size();
            long weekCompleted = weekLogs.stream().filter(MedicationLog::isCompleted).count();
            double weekAdherence = weekTotal > 0 ? (weekCompleted * 100.0 / weekTotal) : 0;

            trends.add(WeeklyTrend.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .adherenceRate(weekAdherence)
                .totalExpected(weekTotal)
                .completedCount(weekCompleted)
                .build());

            weekStart = weekStart.plusDays(7);
        }

        return trends;
    }
}
```

**Step 2: PDF 생성 (iText 또는 Apache PDFBox)**
```java
@Service
public class PDFReportGenerator {

    public byte[] generateAdherencePDF(AdherenceReport report, User user) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // 한글 폰트 설정 (NanumGothic 등)
        PdfFont font = PdfFontFactory.createFont("NanumGothic.ttf", PdfEncodings.IDENTITY_H);
        document.setFont(font);

        // 1. 헤더
        Paragraph title = new Paragraph("복약 순응도 리포트")
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // 2. 환자 정보
        document.add(new Paragraph(String.format("환자명: %s", user.getName())));
        document.add(new Paragraph(String.format("생년월일: %s", user.getBirthDate())));
        document.add(new Paragraph(String.format("보고 기간: %s ~ %s",
            report.getStartDate(), report.getEndDate())));
        document.add(new Paragraph(String.format("리포트 생성일: %s",
            report.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))));
        document.add(new Paragraph("\n"));

        // 3. 전체 순응도
        Paragraph overall = new Paragraph(String.format("📊 전체 순응도: %.1f%%", report.getOverallAdherence()))
            .setFontSize(16)
            .setBold();
        document.add(overall);
        document.add(new Paragraph("\n"));

        // 4. 약물별 상세 테이블
        document.add(new Paragraph("약물별 복약 현황").setFontSize(14).setBold());

        Table table = new Table(new float[]{3, 2, 2, 2, 4});
        table.setWidth(UnitValue.createPercentValue(100));

        // 테이블 헤더
        table.addHeaderCell("약물명");
        table.addHeaderCell("순응도");
        table.addHeaderCell("복용 완료");
        table.addHeaderCell("누락 횟수");
        table.addHeaderCell("누락일");

        // 테이블 데이터
        for (MedicationAdherence adherence : report.getMedicationAdherences()) {
            table.addCell(adherence.getMedication().getName());
            table.addCell(String.format("%.1f%%", adherence.getAdherenceRate()));
            table.addCell(String.format("%d/%d",
                adherence.getCompletedCount(), adherence.getTotalExpected()));
            table.addCell(String.valueOf(adherence.getMissedCount()));

            String missedDatesStr = adherence.getMissedDates().stream()
                .map(date -> date.format(DateTimeFormatter.ofPattern("MM/dd")))
                .limit(5) // 최대 5개만 표시
                .collect(Collectors.joining(", "));
            if (adherence.getMissedDates().size() > 5) {
                missedDatesStr += " ...";
            }
            table.addCell(missedDatesStr);
        }

        document.add(table);
        document.add(new Paragraph("\n"));

        // 5. 주간별 트렌드 그래프 (텍스트 기반 또는 이미지)
        document.add(new Paragraph("📈 주간별 순응도 트렌드").setFontSize(14).setBold());

        for (WeeklyTrend trend : report.getWeeklyTrends()) {
            document.add(new Paragraph(String.format("%s ~ %s: %.1f%% (%d/%d)",
                trend.getWeekStart().format(DateTimeFormatter.ofPattern("MM/dd")),
                trend.getWeekEnd().format(DateTimeFormatter.ofPattern("MM/dd")),
                trend.getAdherenceRate(),
                trend.getCompletedCount(),
                trend.getTotalExpected()
            )));
        }

        // 6. 권장 사항
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("💡 권장 사항").setFontSize(14).setBold());

        if (report.getOverallAdherence() >= 90) {
            document.add(new Paragraph("매우 잘 복용하고 계십니다. 이 상태를 유지하세요."));
        } else if (report.getOverallAdherence() >= 70) {
            document.add(new Paragraph("양호하지만 개선 여지가 있습니다. 누락일을 줄이도록 노력해보세요."));
        } else {
            document.add(new Paragraph("순응도가 낮습니다. 의료진과 상담하여 복약 계획을 재조정하는 것을 권장합니다."));
        }

        // 7. 면책 조항
        document.add(new Paragraph("\n\n"));
        document.add(new Paragraph("본 리포트는 참고용이며, 의료 진단이나 처방을 대체할 수 없습니다.")
            .setFontSize(10)
            .setItalic());

        document.close();
        return baos.toByteArray();
    }
}
```

**Step 3: Frontend - 리포트 생성 UI**
```javascript
const AdherenceReportGenerator = () => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30일 전
  );
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 리포트 데이터 조회
  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/adherence/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('리포트 생성 실패:', error);
      alert('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // PDF 다운로드
  const downloadPDF = async () => {
    try {
      const response = await fetch('/api/adherence/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `복약순응도리포트_${currentUser.name}_${startDate.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="adherence-report-generator">
      <h2>복약 순응도 리포트</h2>

      <div className="date-selector">
        <label>
          시작일:
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={e => setStartDate(new Date(e.target.value))}
          />
        </label>

        <label>
          종료일:
          <input
            type="date"
            value={endDate.toISOString().split('T')[0]}
            onChange={e => setEndDate(new Date(e.target.value))}
          />
        </label>

        <button onClick={generateReport} disabled={loading}>
          {loading ? '생성 중...' : '리포트 생성'}
        </button>
      </div>

      {reportData && (
        <div className="report-preview">
          {/* 전체 순응도 */}
          <div className="overall-adherence">
            <h3>전체 순응도</h3>
            <div className="adherence-circle" style={{
              background: `conic-gradient(#4caf50 ${reportData.overallAdherence * 3.6}deg, #e0e0e0 0deg)`
            }}>
              <span>{reportData.overallAdherence.toFixed(1)}%</span>
            </div>
          </div>

          {/* 약물별 상세 */}
          <div className="medication-details">
            <h3>약물별 복약 현황</h3>
            {reportData.medicationAdherences.map((adherence, idx) => (
              <div key={idx} className="medication-card">
                <h4>{adherence.medication.name}</h4>
                <div className="adherence-bar">
                  <div
                    className="adherence-fill"
                    style={{ width: `${adherence.adherenceRate}%` }}
                  />
                </div>
                <p>
                  순응도: {adherence.adherenceRate.toFixed(1)}%
                  ({adherence.completedCount}/{adherence.totalExpected})
                </p>
                {adherence.missedCount > 0 && (
                  <p className="missed-info">
                    누락: {adherence.missedCount}회
                    ({adherence.missedDates.slice(0, 3).join(', ')}
                    {adherence.missedDates.length > 3 && '...'})
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 주간별 트렌드 */}
          <div className="weekly-trends">
            <h3>주간별 트렌드</h3>
            <div className="trend-chart">
              {reportData.weeklyTrends.map((trend, idx) => (
                <div key={idx} className="trend-bar-container">
                  <div
                    className="trend-bar"
                    style={{ height: `${trend.adherenceRate}%` }}
                  >
                    <span>{trend.adherenceRate.toFixed(0)}%</span>
                  </div>
                  <label>Week {idx + 1}</label>
                </div>
              ))}
            </div>
          </div>

          {/* PDF 다운로드 버튼 */}
          <button className="download-pdf-btn" onClick={downloadPDF}>
            📄 PDF 다운로드
          </button>
        </div>
      )}
    </div>
  );
};
```

#### 의료진 혜택
- 정확한 복약 데이터로 진단 정확도 향상
- "약 효과 없음" = 약을 안 먹어서 vs 약이 안 맞아서 판단 가능
- 객관적 데이터 기반 치료 계획 수립

#### 차별점
- ✅ **B2B 확장 가능성**: 병원 연계 서비스로 발전 (EMR 통합)
- ✅ **의료진-환자 커뮤니케이션 개선**
- ✅ **데이터 기반 의료**: 환자 자가 보고보다 정확한 복약 데이터

---

### 6. **약값 절약 비교** (보험 적용 최적화) ⭐⭐⭐

#### 현실적 문제
- 같은 성분 약인데 가격 천차만별
- 오리지널 약 vs 복제약(제네릭) 차이 모름
- 시니어는 경제적 부담 큼

#### 솔루션
```
[시나리오]
사용자: "리피토 20mg" 등록

시스템:
💡 절약 팁
동일 성분(아토르바스타틴) 복제약 '아토바정'은
월 30,000원 → 20,000원 (33% 저렴)

처방 시 의사에게 "복제약으로 변경 가능할까요?" 문의 가능합니다.
```

#### 데이터 출처
- 건강보험심사평가원 약가 정보 (공공 API)

#### 차별점
- ✅ **실버층 경제적 부담 완화**
- ✅ **사회적 가치** (의료비 절감)

---

## 🚫 버려야 할 기능 (시간 부족)

7주 안에 완성하려면 다음 기능들은 **과감히 제외**합니다:

| 기능 | 제외 이유 |
|------|-----------|
| ❌ AI 식단관리 사진 인식 | 정확도 보장 못함, 한국 음식 인식률 낮음 |
| ❌ 만보계 | 웹에서 센서 접근 제한적, 핵심 아님 |
| ❌ AI 운동 포즈 교정 | 구현 복잡도 높음, 시연 어려움 |
| ❌ 눈바디 AI 체형 분석 | 시간 대비 효과 낮음 |
| ❌ 건강식품 네이버 쇼핑 리뷰 도식화 | 핵심 기능 아님 |
| ❌ 근처 약국 찾기 | Google Maps API만 붙이면 됨 (우선순위 낮음) |

**대신 집중할 것:**
- ✅ 가족 돌봄 네트워크
- ✅ 약-음식 충돌 경고
- ✅ 약봉지 OCR
- ✅ 알약 역검색

---

## 📲 알림 시스템 구현 방식 (중요!)

### 🚨 기술적 제약사항
- **React Native 사용 금지** → 웹앱만 사용
- 웹 푸시는 브라우저 닫으면 알림 안 옴
- 부모님이 항상 브라우저를 켜놓지 않음

### ✅ 현실적인 구현 전략

#### **Phase 1: MVP - 웹 기반 수동 체크** (필수 구현)

```
[부모님 화면]
오늘의 약 복용 체크리스트

☐ 아침 식후 (오전 9시)
  혈압약 (아모디핀) 1알

☐ 점심 식후 (오후 2시)
  당뇨약 (메트포르민) 1알

☐ 저녁 식후 (오후 7시)
  고지혈증약 (아토르바) 1알

[체크박스 클릭 시]
→ Hocuspocus로 실시간 동기화
→ 자녀 화면에 즉시 반영
```

```
[자녀 화면]
어머니 복약 현황 (실시간)

✓ 아침 약 복용 완료 (09:15)
✓ 점심 약 복용 완료 (14:30)
⏰ 저녁 약 (19:00 예정)

[3시간 지나도 체크 안 하면]
→ 자녀 화면에 빨간색 경고 표시
→ 브라우저 알림 (웹 푸시)
```

**기술 구현:**
```javascript
// Hocuspocus로 실시간 동기화
const FamilyMedicationSync = () => {
  const provider = new HocuspocusProvider({
    url: 'ws://your-server.com',
    name: `family-${familyId}`,
  });

  // 부모님이 체크박스 클릭
  const onMedicationCheck = (medId) => {
    // 실시간 동기화
    provider.document.update({
      medications: {
        [medId]: {
          completed: true,
          timestamp: Date.now()
        }
      }
    });

    // Kafka 이벤트 발행
    kafkaProducer.send({
      topic: 'medication-completed',
      messages: [{
        key: familyId,
        value: { medId, userId: parentId }
      }]
    });
  };

  // 자녀는 실시간으로 변경사항 수신
  provider.on('synced', ({ state }) => {
    updateUI(state.medications);
  });
};
```

**장점:**
- ✅ Hocuspocus 실시간 동기화 활용
- ✅ 웹 기술만으로 구현 가능
- ✅ 외부 API 의존도 없음
- ✅ 데모 시연 용이

**단점:**
- ⚠️ 부모님이 웹 접속해야 함
- ⚠️ 능동적 알림 없음 (수동 체크)

---

#### **Phase 2: 확장 - 카카오톡 알림톡 연동** (선택적)

시간 여유 있을 때 추가 구현 (또는 발표 슬라이드에만 "향후 계획"으로 명시)

```
[플로우]
1. 오후 2시: Spring Boot 스케줄러 실행
   → Kafka 이벤트 발행: "medication-reminder"

2. n8n 워크플로우가 이벤트 수신
   → 카카오 알림톡 API 호출

3. 부모님 카카오톡으로 메시지 도착:
   ┌─────────────────────────┐
   │ 💊 약 드실 시간입니다    │
   │                         │
   │ 점심 약 (당뇨약)         │
   │ 메트포르민 1알, 식후 30분│
   │                         │
   │ [복용 완료하기]          │ ← 버튼
   └─────────────────────────┘

4. 버튼 클릭 시:
   → https://your-app.com/med/complete?id=123&token=abc
   → 웹 브라우저 열림 → 자동 복용 완료 처리

5. 3시간 지나도 버튼 안 누르면:
   → 자녀 카카오톡으로 알림
   "어머니가 점심 약을 아직 드시지 않았습니다"
```

**기술 구현:**
```java
// Spring Boot - 카카오 알림톡 발송
@Service
public class KakaoAlimtalkService {

  @Autowired
  private KafkaTemplate<String, MedicationEvent> kafkaTemplate;

  public void sendMedicationReminder(User user, Medication med) {
    String callbackUrl = String.format(
      "https://your-app.com/medication/complete?id=%s&token=%s",
      med.getId(),
      tokenService.generateToken(user)
    );

    KakaoAlimtalkRequest request = KakaoAlimtalkRequest.builder()
      .templateCode("MEDICATION_REMINDER")
      .recipientNo(user.getPhoneNumber())
      .templateParameter(Map.of(
        "medName", med.getName(),
        "dosage", med.getDosage(),
        "timing", med.getTiming()
      ))
      .button(KakaoButton.builder()
        .name("복용 완료하기")
        .type("WL") // 웹링크
        .urlMobile(callbackUrl)
        .urlPc(callbackUrl)
        .build())
      .build();

    kakaoApiClient.sendAlimtalk(request);
  }
}
```

**n8n 워크플로우:**
```
[Kafka Trigger]
  → medication-reminder 이벤트 수신
    ↓
[HTTP Request]
  → 카카오 알림톡 API 호출
    ↓
[Delay 3 hours]
  → 3시간 대기
    ↓
[Check Database]
  → 복용 완료 여부 확인
    ↓
[If Not Completed]
  → 자녀에게 카카오톡 알림 발송
```

**필요한 준비:**
- 카카오 비즈니스 채널 생성 (30분)
- 알림톡 템플릿 사전 등록 (1-2일 대기)
- 카카오 발신 프로필 인증

**장점:**
- ✅ 시니어 친화적 (카카오톡은 이미 사용 중)
- ✅ 높은 도달률 (거의 100% 확인)
- ✅ 버튼 한 번만 클릭
- ✅ 발표 임팩트 높음

**단점:**
- ⚠️ 카카오 승인 과정 필요 (1-2일)
- ⚠️ 구현 시간 추가 소요 (1주)

---

#### **Phase 3: PWA 알림 (보류)**

Progressive Web App 기능은 iOS Safari 지원 제한적이므로 **보류**

---

### 📊 알림 시스템 우선순위

| Phase | 구현 방식 | 필수 여부 | 개발 시간 |
|-------|----------|----------|----------|
| Phase 1 | 웹 기반 수동 체크 + Hocuspocus | ✅ 필수 | 3일 |
| Phase 2 | 카카오톡 알림톡 | ⚠️ 선택 | 1주 |
| Phase 3 | PWA 알림 | ❌ 보류 | - |

**결론:**
- **MVP는 Phase 1만 구현** (웹 기반)
- **시간 남으면 Phase 2 추가**
- **발표 슬라이드에는 Phase 2를 "확장 계획"으로 명시**

---

## 🗂️ 시스템 아키텍처

### 전체 구조
```
┌─────────────────────────────────────────────────────────┐
│                Frontend (React Web Only)                │
│  - React + Vite (JSX)                                   │
│  - Hocuspocus Provider (가족 간 실시간 동기화)           │
│  - TipTap (메모/커뮤니케이션)                            │
└─────────────────┬───────────────────────────────────────┘
                  │ REST API / WebSocket
┌─────────────────▼───────────────────────────────────────┐
│              Backend (Spring Boot)                      │
│  - REST API (약 관리, 식단, 사용자)                      │
│  - Spring Boot Security (JWT 인증)                      │
│  - Spring Boot AI (OCR, 약-음식 충돌 분석)              │
│  - Kafka Producer (이벤트 발행)                         │
│  - Scheduler (복약 알림 스케줄링)                        │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────────────┐
        │                           │
┌───────▼──────┐            ┌──────▼────────┐
│   Database   │            │   External    │
│              │            │   Services    │
│ - MySQL/     │            │ - Hocuspocus  │
│   PostgreSQL │            │   Server      │
│ - Redis      │            │ - Kafka       │
│   (세션,캐시)│            │ - n8n         │
│              │            │ - Naver Clova │
│              │            │   OCR         │
│              │            │ - 식약처 API  │
│              │            │ - 카카오톡    │
│              │            │   (Phase 2)   │
└──────────────┘            └───────────────┘
```

### 주요 모듈

#### Frontend 모듈
```
src/
├── components/
│   ├── auth/           # 로그인, 회원가입
│   ├── family/         # 가족 그룹 관리
│   ├── medication/     # 약 관리
│   │   ├── MedicationList.jsx
│   │   ├── MedicationSchedule.jsx  (부모님용 체크리스트)
│   │   ├── FamilyMonitor.jsx       (자녀용 모니터링)
│   │   └── OCRScanner.jsx          (약봉지 스캔)
│   ├── diet/           # 식단 관리
│   └── dashboard/      # 통합 대시보드
├── hooks/
│   └── useHocuspocus.js  # 실시간 동기화 훅
└── services/
    ├── medicationApi.js
    └── familySync.js
```

#### Backend 서비스
```
com.amapill/
├── controller/
│   ├── AuthController
│   ├── MedicationController
│   ├── FamilyController
│   └── DietController
├── service/
│   ├── MedicationService
│   │   ├── scheduleReminder()
│   │   ├── checkMissedDoses()
│   │   └── analyzeAdherence()
│   ├── FamilyService
│   │   ├── syncMedicationStatus()
│   │   └── notifyFamily()
│   ├── DrugInteractionService  # 약-음식 충돌 체크
│   ├── OCRService              # 약봉지 인식
│   └── KakaoAlimtalkService    # Phase 2
├── kafka/
│   ├── MedicationEventProducer
│   └── NotificationConsumer
└── scheduler/
    └── MedicationReminderScheduler
```

---

## 🚀 현실적인 7주 개발 로드맵

**발표일: 2025년 12월 31일**
**실제 개발 기간: 7주 (발표 준비 1주 제외)**

### Week 1: 인프라 구축 (11/5 ~ 11/11)
- [ ] React + Spring Boot 프로젝트 초기 설정
- [ ] 데이터베이스 스키마 설계
- [ ] JWT 인증/인가 구현
- [ ] Hocuspocus 서버 설정
- [ ] Kafka 설치 및 설정

### Week 2: 가족 돌봄 네트워크 (11/12 ~ 11/18) ⭐ 핵심!
- [ ] 가족 그룹 생성 기능
- [ ] Hocuspocus 실시간 동기화 구현
- [ ] 부모님용 체크리스트 UI
- [ ] 자녀용 모니터링 대시보드
- [ ] Kafka 이벤트 기반 알림 (웹 내부)

### Week 3: 약 관리 기본 기능 (11/19 ~ 11/25)
- [ ] 약 정보 CRUD
- [ ] 복용 스케줄 등록
- [ ] 재고 관리
- [ ] 유효기간 추적
- [ ] 식약처 API 연동 (약 정보 조회)

### Week 4: 차별화 기능 1탄 (11/26 ~ 12/2)
- [ ] **약봉지 OCR 자동 등록** (Naver Clova OCR)
- [ ] **알약 역검색** (식약처 식별정보 API)
- [ ] **약-음식 충돌 경고** (룰 베이스 시스템)

### Week 5: 식단 관리 + 추가 기능 (12/3 ~ 12/9)
- [ ] 식단 기록 기능 (수동 입력)
- [ ] 음식 데이터베이스 (공공 API)
- [ ] 약-음식 충돌 실시간 체크
- [ ] **복약 순응도 리포트** (PDF 생성)

### Week 6: 통합 및 테스트 (12/10 ~ 12/16)
- [ ] 전체 기능 통합 테스트
- [ ] 버그 수정
- [ ] 성능 최적화 (Redis 캐싱)
- [ ] UI/UX 개선
- [ ] Phase 2 (카카오톡) 착수 (시간 되면)

### Week 7: 최종 마무리 (12/17 ~ 12/23)
- [ ] 시니어 사용성 테스트
- [ ] 데이터베이스 마이그레이션
- [ ] 배포 (AWS/GCP)
- [ ] 매뉴얼 작성

### Week 8: 발표 준비 (12/24 ~ 12/31)
- [ ] 발표 자료 제작
- [ ] 데모 시나리오 준비
- [ ] 리허설
- [ ] **12/31 최종 발표** 🎉

---

## 🎯 MVP 기능 우선순위

7주 안에 완성해야 하므로, 우선순위를 명확히 합니다.

| 우선순위 | 기능 | 개발 시간 | 차별화 | 필수 여부 |
|---------|------|----------|--------|----------|
| 🥇 1순위 | **가족 돌봄 네트워크** | 2주 | ⭐⭐⭐⭐⭐ | ✅ 필수 |
| 🥈 2순위 | **약-음식 충돌 경고** | 1.5주 | ⭐⭐⭐⭐⭐ | ✅ 필수 |
| 🥉 3순위 | **약봉지 OCR 자동 등록** | 1.5주 | ⭐⭐⭐⭐ | ✅ 필수 |
| 4순위 | **알약 역검색** | 1주 | ⭐⭐⭐⭐ | ✅ 필수 |
| 5순위 | **복약 순응도 리포트** | 3일 | ⭐⭐⭐ | ⚠️ 선택 |
| 6순위 | 약값 절약 비교 | 2일 | ⭐⭐⭐ | ⚠️ 선택 |
| 7순위 | 카카오톡 알림톡 (Phase 2) | 1주 | ⭐⭐⭐⭐ | ⚠️ 시간 있으면 |

**나머지 시간**: 기본 CRUD + 통합 + 테스트

---

## 📊 데이터베이스 설계 (ERD)

### 주요 테이블

```sql
-- 사용자 및 가족
users (
  id, email, password_hash, name, phone, role, created_at
)

family_groups (
  id, name, created_by, created_at
)

family_members (
  id, family_group_id, user_id, role [parent/child], joined_at
)

-- 약 관리
medications (
  id, user_id, name, ingredient, dosage, timing,
  start_date, end_date, quantity, remaining,
  expiry_date, created_at
)

medication_schedules (
  id, medication_id, time, days_of_week, active
)

medication_logs (
  id, medication_id, user_id, scheduled_time,
  completed_time, completed, missed, created_at
)

-- 약-음식 상호작용
drug_food_interactions (
  id, drug_name, food_name, ingredient,
  reason, severity, alternatives
)

-- 식단 관리
diet_logs (
  id, user_id, meal_type [breakfast/lunch/dinner/snack],
  food_name, calories, recorded_at
)

diet_warnings (
  id, user_id, diet_log_id, medication_id,
  warning_message, severity, created_at
)

-- 알림
notifications (
  id, user_id, type, title, message,
  read, created_at
)
```

---

## 🔒 법적 리스크 회피 전략

### ⚠️ 주의해야 할 법규

#### 1. 약 추천 금지 (약사법 위반)
- **위반**: "혈압약으로 ○○○을 드세요"
- **해결**:
  - ✅ "의사 처방에 따라 등록하세요"
  - ✅ 정보 제공만 (효능, 주의사항)
  - ✅ "약사와 상담하세요" 문구 삽입

#### 2. 허위/과장 광고 금지
- **위반**: "이 약을 먹으면 혈압이 낮아집니다"
- **해결**:
  - ✅ 식약처 공식 정보만 표시
  - ✅ "일반적인 효능" 수준으로 제한

#### 3. 개인 의료정보 보호
- **민감정보**: 약 복용 내역, 건강 상태
- **해결**:
  - ✅ 명시적 동의 획득
  - ✅ 암호화 저장
  - ✅ 가족 공유도 본인 동의 필수

### ✅ 안전한 기능 구현 가이드

```javascript
// ❌ 잘못된 예시
"혈압이 높으시네요. 아모디핀을 복용하세요."

// ✅ 올바른 예시
"혈압약 복용 스케줄을 등록하시겠습니까?
 약은 의사의 처방에 따라 복용해주세요."

// ❌ 잘못된 예시
"이 약은 혈압을 낮춥니다."

// ✅ 올바른 예시
"[식약처 정보] 이 약은 고혈압 치료에 사용됩니다.
 자세한 사항은 의사, 약사와 상담하세요."
```

---

## 🔒 보안 고려사항

### 데이터 보안
- 개인 건강정보 AES-256 암호화 저장
- HTTPS 통신 강제 (Let's Encrypt)
- SQL Injection 방지 (Prepared Statement)
- XSS 공격 방지 (입력값 sanitization)

### 인증/인가
- JWT 기반 토큰 인증 (Access Token 15분, Refresh Token 7일)
- 역할 기반 접근 제어 (부모/자녀 권한 분리)
- Redis 세션 관리 (토큰 블랙리스트)
- BCrypt 비밀번호 암호화 (saltRounds: 10)

### 가족 정보 공유 보안
- 가족 초대 시 이메일/SMS 인증 필수
- 읽기 전용 vs 편집 권한 분리
- 민감 정보 접근 로그 기록
- 가족 그룹 탈퇴 시 데이터 접근 즉시 차단

---

## 💡 차별화 포인트 (발표용)

| 항목 | 기존 앱 (알약, 똑닥) | 우리 앱 (AMA...Pill) |
|------|---------------------|-------------------|
| 타겟 | 개인 사용자 | 시니어 + 자녀 (양면 시장) |
| 가족 연동 | ❌ 없음 | ✅ 실시간 돌봄 네트워크 |
| 약-음식 충돌 | ❌ 없음 (약-약만) | ✅ 자동 경고 시스템 |
| 데이터 입력 | 수동 입력만 | ✅ OCR 자동 인식 |
| 의료진 소통 | ❌ 없음 | ✅ 복약 순응도 리포트 |
| 알림 방식 | 앱 푸시만 | ✅ 웹 + 카카오톡 (Phase 2) |
| 경제적 가치 | ❌ 없음 | ✅ 약값 절약 비교 |

### 핵심 메시지
> "혼자가 아닌, 가족이 함께하는 약 관리"
> "떨어져 있어도 부모님 건강을 지킬 수 있습니다"

---

## 📱 향후 확장 계획 (발표 슬라이드용)

### Phase 3: React Native 전환 (2026년)
- 현재 React 웹앱을 React Native로 마이그레이션
- 모바일 네이티브 기능 활용:
  - 카메라 접근 개선
  - 백그라운드 푸시 알림
  - 디바이스 센서 연동

### Phase 4: B2B 확장
- **병원 연계**: 복약 순응도 리포트 자동 전송
- **약국 연계**: 처방전 자동 등록
- **보험사 연계**: 복약 이행 시 보험료 할인

### Phase 5: AI 고도화
- 개인화된 건강 예측 모델
- 자연어 기반 건강 상담 챗봇
- 음식 사진 인식 (GPT-4 Vision)

---

## 🤝 팀 역할 분담

### 팀원 1: Frontend Lead
- React 컴포넌트 개발
- Hocuspocus 실시간 동기화 구현
- 부모님/자녀 양면 UI 설계
- 반응형 디자인 (시니어 친화적)

### 팀원 2: Backend Lead + AI
- Spring Boot REST API 개발
- Kafka 이벤트 처리
- OCR 연동 (Naver Clova)
- 약-음식 충돌 룰 엔진 개발

### 팀원 3: Database + DevOps
- 데이터베이스 설계 및 최적화
- Redis 캐싱 전략
- n8n 워크플로우 구성 (알림 자동화)
- AWS/GCP 배포 및 CI/CD

> **참고**: 실제 역할은 팀원 강점에 따라 유연하게 조정

---

## 📚 참고 자료

### 기술 문서
- [React 공식 문서](https://react.dev/)
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Hocuspocus 문서](https://tiptap.dev/hocuspocus)
- [Kafka 문서](https://kafka.apache.org/documentation/)
- [Naver Clova OCR API](https://www.ncloud.com/product/aiService/ocr)

### 공공 데이터
- [식약처 의약품안전나라 API](https://nedrug.mfds.go.kr/index)
- [식약처 의약품 식별정보 API](https://www.data.go.kr/data/15075163/fileData.do)
- [건강보험심사평가원 약가 정보](https://www.hira.or.kr/)

### 의료 정보
- 대한약사회 복약지도 자료
- 식약처 의약품 안전성 정보
- ⚠️ 주의: 병원 웹사이트는 일부 접근 제한이 있을 수 있음. 공개 PDF 자료나 학술 자료 활용 권장

### 법규 확인
- 약사법 (의약품 추천 금지)
- 의료법 (허위/과장 광고 금지)
- 개인정보보호법 (민감정보 처리)

---

## 📝 의사결정 사항

### ✅ 확정된 결정
- ✅ React 웹앱만 사용 (React Native 금지)
- ✅ 가족 돌봄 네트워크를 핵심 차별화로 설정
- ✅ Phase 1 (웹 알림) 필수, Phase 2 (카카오톡) 선택
- ✅ AI 식단 사진 인식 제외
- ✅ 만보계, 운동 포즈 교정 제외

### ⚠️ 미결 사항
- [ ] PostgreSQL vs MySQL 선택
- [ ] Spring Cloud Security 적용 여부
- [ ] 배포 환경: AWS vs GCP
- [ ] 카카오톡 알림톡 구현 여부 (시간 보고 결정)

### ✅ 확정된 기술 결정 (2025-11-05 업데이트)

#### 백엔드 기술 스택
- ✅ **Java 21 LTS**: 2029년까지 장기 지원, Virtual Threads, ZGC
- ✅ **Spring Boot 3.4.7**: 6개월 이상 검증된 안정 버전 (49개 버그 수정)
  - 3.5.0 제외 이유: 너무 최신 (2025년 5월 출시, 검증 부족)
  - 프로덕션 환경에서 충분히 검증됨
- ✅ **Spring Cloud 2024.0.2 (Moorgate)**: Spring Boot 3.4.x 완벽 호환
  - Spring Framework 6.2.0 통합
  - Eureka Server 최신 기능 지원

#### OCR 및 외부 API
- ✅ **OCR**: Google Cloud Vision API (메인) + Tesseract.js (Fallback)
  - Naver Clova OCR 제외 이유: 유료 (기본 유지비 발생), 무료 한도 불명확
  - Google Vision 선택 이유: 무료 한도 1,000건/월, 한글 인식률 95%+
  - Tesseract.js: 완전 무료 백업 솔루션 (인식률 80%)
- ✅ **약-음식 상호작용**: 룰 베이스 시스템 (AI 불필요)
- ✅ **식약처 API**: 공공데이터포털 통해 무료 사용 가능 확인

---

## 🎯 성공 지표 (KPI)

### 기능 완성도
- 핵심 4대 기능 구현률 100% (가족 돌봄, 약-음식 충돌, OCR, 알약 역검색)
- Critical 버그: 0개
- Major 버그: < 3개

### 사용성 (발표 데모)
- 부모님 역할: 3클릭 이내에 약 복용 체크
- 자녀 역할: 실시간 모니터링 즉시 확인
- OCR 인식률: > 80%

### 기술적 목표
- API 응답 시간: < 500ms
- Hocuspocus 동기화 지연: < 1초
- 웹 페이지 로딩: < 2초

---

## 💬 회의록

### 2025-11-05 회의
- **참석자**: 팀원 전체
- **결정사항**:
  - 음식 사진 칼로리 추정 → 제외 (구현 어려움, 정확도 낮음)
  - 가족 돌봄 네트워크 → 핵심 기능으로 선정
  - 알림 시스템 Phase 1 (웹) 필수, Phase 2 (카카오톡) 선택
  - React Native 사용 금지 확정
  - 7주 내 MVP 완성 목표

---

## 📞 연락처 및 저장소

- **GitHub Repository**: https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Front
- **Backend Repository**: (Backend 저장소 URL)
- **프로젝트 관리**: (Notion/Jira 링크)
- **팀 커뮤니케이션**: (Slack/Discord 링크)

---

**최종 수정일**: 2025-11-05
**버전**: 2.0 (대폭 개선)
**작성자**: AMA...Pill 개발팀
**문서 상태**: 참신한 차별화 기능 추가, 7주 로드맵 확정
