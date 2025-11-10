# OCR API 명세서 (Stage 4)

> SilverCare OCR 기능 Backend API 정의서
>
> **버전**: 1.0
> **작성일**: 2025-11-10
> **우선순위**: Stage 4 핵심 기능 (MVP Essential)

---

## 📋 목차

1. [개요](#-개요)
2. [API 엔드포인트](#-api-엔드포인트)
3. [Request/Response DTO](#-requestresponse-dto)
4. [Frontend 통합 가이드](#-frontend-통합-가이드)
5. [에러 처리](#-에러-처리)
6. [개발 우선순위](#-개발-우선순위)

---

## 🎯 개요

### 목적
처방전 사진에서 약물 정보를 자동으로 추출하고, 알약 외관으로 약물을 검색하여 사용자의 복약 관리를 간편하게 지원합니다.

### 핵심 기능
1. **처방전 OCR 인식** - 약봉지/처방전 이미지에서 약 정보 추출
2. **알약 역검색** - 모양, 색상, 각인으로 약 식별
3. **약 관리 자동 등록** - OCR 결과를 약 CRUD에 바로 연결

### 기술 스택 (Backend)
- **Primary OCR**: Google Cloud Vision API (무료 한도 1,000건/월)
- **Fallback OCR**: Tesseract.js (무료, 오프라인)
- **약품 DB**: 식약처 의약품안전나라 API (공공데이터포털)
- **Confidence Threshold**: 0.85 이상 → 자동 등록, 미만 → 수동 검증

---

## 🔌 API 엔드포인트

### 1. 처방전 OCR 인식

#### **POST** `/api/ocr/prescription`

약봉지 또는 처방전 이미지에서 약물 정보를 추출합니다.

**Request**

```http
POST /api/ocr/prescription
Content-Type: multipart/form-data
Authorization: Bearer {JWT_TOKEN}

{
  "file": <binary image data>,
  "ocrEngine": "google-vision" | "tesseract" (optional, default: "google-vision")
}
```

**Request (Alternative - Base64)**

```json
POST /api/ocr/prescription
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "ocrEngine": "google-vision" | "tesseract"
}
```

**Response (Success - 200 OK)**

```json
{
  "success": true,
  "data": {
    "ocrId": "ocr_20251110_abc123",
    "extractedText": "약품명: 아모디핀정 5mg\n복용량: 1정\n복용 일정: 하루 1회 (저녁 식후)\n투약 기간: 2025-11-01 ~ 2025-12-01\n총 수량: 30정\n주의사항: 자몽 주스와 동시 복용 금지",
    "parsedMedication": {
      "name": "아모디핀정",
      "ingredient": "Amlodipine",
      "dosage": "5mg",
      "dosageAmount": "1정",
      "timing": ["저녁", "식후"],
      "frequency": "하루 1회",
      "startDate": "2025-11-01",
      "endDate": "2025-12-01",
      "quantity": 30,
      "remaining": 30,
      "warnings": ["자몽 주스와 동시 복용 금지"]
    },
    "confidence": 0.92,
    "ocrEngine": "google-vision",
    "processingTimeMs": 1247,
    "insights": [
      "아모디핀정을 약 관리에 등록하고 일정을 추적하세요",
      "식사 기록 중 자몽/비타민K 식품과의 충돌을 확인하세요"
    ]
  },
  "timestamp": "2025-11-10T14:32:15Z"
}
```

**Response (Low Confidence - 200 OK)**

```json
{
  "success": true,
  "data": {
    "ocrId": "ocr_20251110_def456",
    "extractedText": "약품명: 메트포르민...\n복용량: 불명확",
    "parsedMedication": {
      "name": "메트포르민",
      "ingredient": null,
      "dosage": null,
      "dosageAmount": null,
      "timing": null,
      "frequency": null,
      "startDate": null,
      "endDate": null,
      "quantity": null,
      "remaining": null,
      "warnings": []
    },
    "confidence": 0.63,
    "ocrEngine": "tesseract",
    "processingTimeMs": 892,
    "insights": [
      "⚠️ 인식 정확도가 낮습니다. 수동으로 정보를 확인하고 수정해주세요."
    ],
    "requiresManualVerification": true
  },
  "timestamp": "2025-11-10T14:35:22Z"
}
```

**Response (Error - 400 Bad Request)**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE_FORMAT",
    "message": "지원하지 않는 이미지 형식입니다. JPG, PNG, HEIC만 가능합니다.",
    "details": {
      "receivedType": "application/pdf",
      "supportedTypes": ["image/jpeg", "image/png", "image/heic"]
    }
  },
  "timestamp": "2025-11-10T14:38:10Z"
}
```

**Response (Error - 500 Internal Server Error)**

```json
{
  "success": false,
  "error": {
    "code": "OCR_ENGINE_FAILURE",
    "message": "OCR 엔진에서 이미지를 처리하지 못했습니다.",
    "details": {
      "engine": "google-vision",
      "reason": "API quota exceeded",
      "fallbackUsed": "tesseract"
    }
  },
  "timestamp": "2025-11-10T14:40:05Z"
}
```

---

### 2. 알약 역검색

#### **POST** `/api/ocr/pill-search`

알약의 외관 특징(모양, 색상, 각인)으로 약품을 검색합니다.

**Request**

```json
POST /api/ocr/pill-search
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "shape": "원형",
  "color": "흰색",
  "printFront": "A",
  "printBack": "5",
  "line": false
}
```

**Request Parameters**

| 필드 | 타입 | 필수 | 설명 | 예시 |
|-----|------|-----|------|------|
| `shape` | string | 선택 | 알약 모양 | "원형", "타원형", "장방형", "사각형", "삼각형", "육각형", "팔각형", "마름모형" |
| `color` | string | 선택 | 알약 색상 | "흰색", "노란색", "분홍색", "빨간색", "주황색", "갈색", "연두색", "초록색", "청록색", "파란색", "남색", "자주색", "보라색", "회색", "검정색", "투명" |
| `printFront` | string | 선택 | 앞면 각인 | "A", "BP5", "ABC" |
| `printBack` | string | 선택 | 뒷면 각인 | "5", "100", "XYZ" |
| `line` | boolean | 선택 | 분할선 유무 | true, false |

**Response (Success - 200 OK)**

```json
{
  "success": true,
  "data": {
    "totalCount": 3,
    "results": [
      {
        "itemSeq": "200003456",
        "itemName": "아모디핀정5밀리그램",
        "entpName": "한국제약",
        "itemImage": "https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/200003456",
        "chart": "원형",
        "printFront": "A",
        "printBack": "5",
        "lengLong": "8.0",
        "lengShort": "8.0",
        "thick": "3.5",
        "imgRegistTs": "20231015",
        "classNo": "214",
        "className": "순환계용약",
        "etcOtcName": "전문의약품",
        "itemPermitDate": "20100315",
        "formCodeName": "정제",
        "markCodeFrontAnal": "A",
        "markCodeBackAnal": "5",
        "markCodeFrontImg": "https://nedrug.mfds.go.kr/pbp/cmn/markImageDownload/A",
        "markCodeBackImg": "https://nedrug.mfds.go.kr/pbp/cmn/markImageDownload/5",
        "changeDate": "20231015",
        "markCodeFront": "A",
        "markCodeBack": "5",
        "itemEngName": "Amlodipine Tab. 5mg",
        "ediCode": "655900012",
        "ingredient": "Amlodipine Besylate 6.935mg (Amlodipine 5mg)",
        "efficacy": "고혈압, 협심증",
        "usageMethod": "1일 1회 5mg 경구 투여, 필요시 10mg까지 증량",
        "atpnWarnQesitm": "이 약은 임부에게 투여 시 안전성이 확립되지 않았으므로 임부 또는 임신하고 있을 가능성이 있는 부인에게는 치료상의 유익성이 위험성을 상회한다고 판단되는 경우에만 투여한다.",
        "atpnQesitm": "자몽 주스는 이 약의 혈중 농도를 증가시킬 수 있으므로 병용 투여를 피한다.",
        "intrcQesitm": "CYP3A4 억제제(케토코나졸, 이트라코나졸, 리토나비르)와 병용 시 주의",
        "seQesitm": "어지러움, 두통, 안면홍조, 부종, 피로감",
        "depositMethodQesitm": "기밀용기, 실온(1~30℃) 보관",
        "confidence": 0.95
      },
      {
        "itemSeq": "200007891",
        "itemName": "노바스크정5밀리그램",
        "entpName": "한국화이자제약",
        "confidence": 0.88
      },
      {
        "itemSeq": "200012345",
        "itemName": "암로디핀정5밀리그램",
        "entpName": "대웅제약",
        "confidence": 0.82
      }
    ]
  },
  "timestamp": "2025-11-10T15:10:30Z"
}
```

**Response (No Results - 200 OK)**

```json
{
  "success": true,
  "data": {
    "totalCount": 0,
    "results": [],
    "suggestions": [
      "검색 조건을 완화해보세요 (색상이나 각인 하나만 입력)",
      "각인 문자의 대소문자를 구분하지 않고 시도해보세요",
      "처방전 OCR 기능을 사용하여 약 이름으로 직접 검색해보세요"
    ]
  },
  "timestamp": "2025-11-10T15:12:45Z"
}
```

**Response (Error - 400 Bad Request)**

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_SEARCH_PARAMS",
    "message": "최소 한 가지 검색 조건을 입력해주세요.",
    "details": {
      "requiredParams": ["shape", "color", "printFront", "printBack"],
      "providedParams": []
    }
  },
  "timestamp": "2025-11-10T15:15:20Z"
}
```

---

### 3. OCR 결과 기반 약 등록

#### **POST** `/api/medications/from-ocr`

OCR 인식 결과를 기반으로 약을 바로 등록합니다.

**Request**

```json
POST /api/medications/from-ocr
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "ocrId": "ocr_20251110_abc123",
  "medication": {
    "name": "아모디핀정",
    "ingredient": "Amlodipine",
    "dosage": "5mg",
    "dosageAmount": "1정",
    "timing": ["저녁", "식후"],
    "frequency": "하루 1회",
    "startDate": "2025-11-01",
    "endDate": "2025-12-01",
    "quantity": 30,
    "remaining": 30,
    "warnings": ["자몽 주스와 동시 복용 금지"]
  },
  "manualCorrections": {
    "dosage": "10mg"
  }
}
```

**Response (Success - 201 Created)**

```json
{
  "success": true,
  "data": {
    "medicationId": "med_20251110_xyz789",
    "userId": "user_12345",
    "name": "아모디핀정",
    "ingredient": "Amlodipine",
    "dosage": "10mg",
    "dosageAmount": "1정",
    "timing": ["저녁", "식후"],
    "frequency": "하루 1회",
    "startDate": "2025-11-01",
    "endDate": "2025-12-01",
    "quantity": 30,
    "remaining": 30,
    "warnings": ["자몽 주스와 동시 복용 금지"],
    "createdAt": "2025-11-10T15:20:00Z",
    "createdFrom": "ocr",
    "ocrId": "ocr_20251110_abc123",
    "schedules": [
      {
        "scheduleId": "sched_001",
        "time": "19:00",
        "timing": "저녁 식후",
        "dosageAmount": "1정",
        "enabled": true
      }
    ]
  },
  "timestamp": "2025-11-10T15:20:00Z"
}
```

---

## 📦 Request/Response DTO

### OCRPrescriptionRequest

```typescript
interface OCRPrescriptionRequest {
  // Multipart/form-data
  file?: File;  // 이미지 파일

  // JSON
  imageBase64?: string;  // Base64 인코딩 이미지

  // 공통
  ocrEngine?: 'google-vision' | 'tesseract';  // default: 'google-vision'
}
```

### OCRPrescriptionResponse

```typescript
interface OCRPrescriptionResponse {
  success: boolean;
  data: {
    ocrId: string;
    extractedText: string;
    parsedMedication: ParsedMedication;
    confidence: number;  // 0.0 ~ 1.0
    ocrEngine: 'google-vision' | 'tesseract';
    processingTimeMs: number;
    insights: string[];
    requiresManualVerification?: boolean;  // confidence < 0.85
  };
  timestamp: string;  // ISO 8601
}
```

### ParsedMedication

```typescript
interface ParsedMedication {
  name: string | null;           // 약품명
  ingredient: string | null;     // 주성분
  dosage: string | null;         // 용량 (5mg, 500mg 등)
  dosageAmount: string | null;   // 1회 복용량 (1정, 2정 등)
  timing: string[] | null;       // ['아침', '식후']
  frequency: string | null;      // '하루 1회', '하루 2회'
  startDate: string | null;      // YYYY-MM-DD
  endDate: string | null;        // YYYY-MM-DD
  quantity: number | null;       // 총 수량
  remaining: number | null;      // 남은 수량
  warnings: string[];            // 주의사항
}
```

### PillSearchRequest

```typescript
interface PillSearchRequest {
  shape?: string;       // 알약 모양
  color?: string;       // 알약 색상
  printFront?: string;  // 앞면 각인
  printBack?: string;   // 뒷면 각인
  line?: boolean;       // 분할선 유무
}
```

### PillSearchResponse

```typescript
interface PillSearchResponse {
  success: boolean;
  data: {
    totalCount: number;
    results: PillSearchResult[];
    suggestions?: string[];  // 검색 결과가 없을 때
  };
  timestamp: string;
}
```

### PillSearchResult

```typescript
interface PillSearchResult {
  itemSeq: string;              // 품목일련번호
  itemName: string;             // 약품명
  entpName: string;             // 제조사
  itemImage: string;            // 약품 이미지 URL
  chart: string;                // 모양
  printFront: string;           // 앞면 각인
  printBack: string;            // 뒷면 각인
  lengLong: string;             // 장축 길이
  lengShort: string;            // 단축 길이
  thick: string;                // 두께
  classNo: string;              // 분류번호
  className: string;            // 분류명
  etcOtcName: string;           // 전문/일반
  itemPermitDate: string;       // 허가일자
  formCodeName: string;         // 제형
  itemEngName: string;          // 영문명
  ediCode: string;              // EDI 코드
  ingredient: string;           // 주성분
  efficacy: string;             // 효능효과
  usageMethod: string;          // 용법용량
  atpnWarnQesitm: string;       // 경고
  atpnQesitm: string;           // 주의사항
  intrcQesitm: string;          // 상호작용
  seQesitm: string;             // 부작용
  depositMethodQesitm: string;  // 보관방법
  confidence: number;           // 매칭 신뢰도 (0.0 ~ 1.0)
}
```

### MedicationFromOCRRequest

```typescript
interface MedicationFromOCRRequest {
  ocrId: string;
  medication: ParsedMedication;
  manualCorrections?: Partial<ParsedMedication>;  // 사용자 수정사항
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

---

## 🔧 Frontend 통합 가이드

### 1. ocrApiClient 확장

현재 `src/core/services/api/ocrApiClient.js`는 기본 구조만 있으므로 다음과 같이 확장합니다:

```javascript
// src/core/services/api/ocrApiClient.js
import ApiClient from './ApiClient'

class OcrApiClient extends ApiClient {
  constructor() {
    super({ basePath: '/api/ocr' })
  }

  /**
   * 처방전 이미지를 OCR로 인식
   * @param {FormData} formData - file 포함
   * @param {Object} options - { ocrEngine?: 'google-vision' | 'tesseract' }
   * @returns {Promise<OCRPrescriptionResponse>}
   */
  async recognizePrescription(formData, options = {}) {
    const mockResponse = () => ({
      ocrId: `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      extractedText: `약품명: ${formData?.get('file')?.name || '신규 처방약'}
복용량: 1정
복용 일정: 하루 1회 (저녁 식후)
주의사항: 자몽 주스와 동시 복용 금지`,
      parsedMedication: {
        name: formData?.get('file')?.name?.replace(/\.[^/.]+$/, '') || '신규 처방약',
        ingredient: 'Amlodipine',
        dosage: '5mg',
        dosageAmount: '1정',
        timing: ['저녁', '식후'],
        frequency: '하루 1회',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quantity: 30,
        remaining: 30,
        warnings: ['자몽 주스와 동시 복용 금지']
      },
      confidence: 0.92,
      ocrEngine: options.ocrEngine || 'google-vision',
      processingTimeMs: Math.floor(Math.random() * 1000) + 500,
      insights: [
        '인식한 내용을 약 관리 CRUD에 바로 등록하세요.',
        '식단 기록 시 자몽, 비타민 K 음식과 충돌 여부를 확인하세요.',
      ],
    })

    if (options.ocrEngine) {
      formData.append('ocrEngine', options.ocrEngine)
    }

    return this.post('/prescription', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, { mockResponse })
  }

  /**
   * Base64 이미지로 OCR 인식
   * @param {string} imageBase64 - Base64 인코딩 이미지
   * @param {Object} options - { ocrEngine?: 'google-vision' | 'tesseract' }
   * @returns {Promise<OCRPrescriptionResponse>}
   */
  async recognizePrescriptionBase64(imageBase64, options = {}) {
    const mockResponse = () => ({
      ocrId: `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      extractedText: '약품명: Base64 처방약\n복용량: 1정\n복용 일정: 하루 1회 (저녁 식후)',
      parsedMedication: {
        name: 'Base64 처방약',
        ingredient: 'Unknown',
        dosage: '5mg',
        dosageAmount: '1정',
        timing: ['저녁', '식후'],
        frequency: '하루 1회',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quantity: 30,
        remaining: 30,
        warnings: []
      },
      confidence: 0.78,
      ocrEngine: options.ocrEngine || 'tesseract',
      processingTimeMs: 1200,
      insights: ['⚠️ 인식 정확도가 낮습니다. 수동으로 정보를 확인하고 수정해주세요.'],
      requiresManualVerification: true
    })

    return this.post('/prescription', {
      imageBase64,
      ocrEngine: options.ocrEngine || 'google-vision'
    }, {}, { mockResponse })
  }

  /**
   * 알약 역검색
   * @param {PillSearchRequest} searchParams
   * @returns {Promise<PillSearchResponse>}
   */
  async searchPill(searchParams) {
    const mockResponse = () => ({
      totalCount: 2,
      results: [
        {
          itemSeq: '200003456',
          itemName: '아모디핀정5밀리그램',
          entpName: '한국제약',
          itemImage: 'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/200003456',
          chart: searchParams.shape || '원형',
          printFront: searchParams.printFront || 'A',
          printBack: searchParams.printBack || '5',
          lengLong: '8.0',
          lengShort: '8.0',
          thick: '3.5',
          className: '순환계용약',
          etcOtcName: '전문의약품',
          formCodeName: '정제',
          itemEngName: 'Amlodipine Tab. 5mg',
          ingredient: 'Amlodipine Besylate 6.935mg',
          efficacy: '고혈압, 협심증',
          usageMethod: '1일 1회 5mg 경구 투여',
          atpnQesitm: '자몽 주스는 이 약의 혈중 농도를 증가시킬 수 있으므로 병용 투여를 피한다.',
          confidence: 0.95
        },
        {
          itemSeq: '200007891',
          itemName: '노바스크정5밀리그램',
          entpName: '한국화이자제약',
          itemImage: 'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/200007891',
          chart: '원형',
          printFront: 'A',
          printBack: '5',
          confidence: 0.88
        }
      ]
    })

    return this.post('/pill-search', searchParams, {}, { mockResponse })
  }
}

export const ocrApiClient = new OcrApiClient()
export { OcrApiClient }
```

### 2. 컴포넌트 사용 예시

```jsx
// src/features/ocr/pages/PrescriptionScan.jsx
import { ocrApiClient } from '@/core/services/api/ocrApiClient'

const handleRecognize = async () => {
  if (!file) return

  setIsProcessing(true)
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await ocrApiClient.recognizePrescription(formData)

    if (response.confidence >= 0.85) {
      setResult(response)
      setShowAutoRegisterPrompt(true)
    } else {
      setResult(response)
      setRequiresManualCorrection(true)
    }
  } catch (error) {
    console.error('OCR 인식 실패:', error)
    toast.error('이미지 인식에 실패했습니다. 다시 시도해주세요.')
  } finally {
    setIsProcessing(false)
  }
}
```

### 3. Zustand Store 연동 (선택사항)

```javascript
// src/stores/ocrStore.js
import { create } from 'zustand'
import { ocrApiClient } from '@/core/services/api/ocrApiClient'

export const useOcrStore = create((set, get) => ({
  currentOcrResult: null,
  isProcessing: false,
  error: null,

  recognizePrescription: async (formData) => {
    set({ isProcessing: true, error: null })
    try {
      const result = await ocrApiClient.recognizePrescription(formData)
      set({ currentOcrResult: result, isProcessing: false })
      return result
    } catch (error) {
      set({ error: error.message, isProcessing: false })
      throw error
    }
  },

  searchPill: async (searchParams) => {
    set({ isProcessing: true, error: null })
    try {
      const result = await ocrApiClient.searchPill(searchParams)
      set({ isProcessing: false })
      return result
    } catch (error) {
      set({ error: error.message, isProcessing: false })
      throw error
    }
  },

  clearOcrResult: () => set({ currentOcrResult: null, error: null }),
}))
```

---

## ⚠️ 에러 처리

### 에러 코드 정의

| 에러 코드 | HTTP Status | 설명 | 해결 방법 |
|----------|-------------|------|----------|
| `INVALID_IMAGE_FORMAT` | 400 | 지원하지 않는 이미지 형식 | JPG, PNG, HEIC 형식으로 변환 |
| `IMAGE_TOO_LARGE` | 400 | 이미지 크기 초과 (>10MB) | 이미지 압축 후 재시도 |
| `INSUFFICIENT_SEARCH_PARAMS` | 400 | 검색 조건 부족 | 최소 1개 이상 조건 입력 |
| `OCR_ENGINE_FAILURE` | 500 | OCR 엔진 오류 | Fallback(Tesseract) 사용 또는 재시도 |
| `EXTERNAL_API_ERROR` | 502 | 식약처 API 오류 | 캐시된 데이터 사용 또는 재시도 |
| `QUOTA_EXCEEDED` | 429 | API 할당량 초과 | Fallback 엔진 사용 또는 대기 |

### Frontend 에러 처리 예시

```javascript
try {
  const result = await ocrApiClient.recognizePrescription(formData)
} catch (error) {
  if (error.response?.status === 400) {
    if (error.response.data.error.code === 'INVALID_IMAGE_FORMAT') {
      toast.error('JPG, PNG 형식의 이미지만 업로드 가능합니다.')
    } else if (error.response.data.error.code === 'IMAGE_TOO_LARGE') {
      toast.error('이미지 크기는 10MB 이하로 업로드해주세요.')
    }
  } else if (error.response?.status === 500) {
    toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  } else {
    toast.error('알 수 없는 오류가 발생했습니다.')
  }
}
```

---

## 🚀 개발 우선순위

### Phase 1 - MVP 필수 기능 (Week 1-2)
1. ✅ **처방전 OCR 인식** - `POST /api/ocr/prescription`
   - Google Vision API 연동
   - 기본 텍스트 추출
   - 약물 정보 파싱 (이름, 용량, 일정)
2. ✅ **약 관리 연동** - `POST /api/medications/from-ocr`
   - OCR 결과 → 약 등록 자동화
   - Confidence 기반 자동/수동 분기

### Phase 2 - 고도화 (Week 3-4)
3. **알약 역검색** - `POST /api/ocr/pill-search`
   - 식약처 API 연동
   - 검색 결과 정확도 향상
4. **수동 보정 UI**
   - Low confidence 결과 수정
   - 인식 오류 피드백 수집

### Phase 3 - 최적화 (Week 5+)
5. **Tesseract Fallback** - Google Vision 할당량 초과 시
6. **이미지 전처리** - 회전, 크롭, 밝기 보정
7. **캐싱 전략** - 동일 이미지 중복 인식 방지

---

## 📌 참고사항

### Backend 개발 시 고려사항

1. **Google Cloud Vision API 설정**
   ```bash
   # 환경 변수
   GOOGLE_CLOUD_VISION_API_KEY=your_api_key
   GOOGLE_CLOUD_VISION_QUOTA_LIMIT=1000  # 월 무료 한도
   ```

2. **식약처 의약품안전나라 API**
   ```bash
   # 공공데이터포털에서 API 키 발급
   MFDS_API_KEY=your_api_key
   MFDS_API_ENDPOINT=https://apis.data.go.kr/1471000/DrbEasyDrugInfoService
   ```

3. **이미지 업로드 제한**
   - 최대 파일 크기: 10MB
   - 지원 형식: JPG, PNG, HEIC
   - 압축: 서버에서 자동 리사이징 (최대 2048x2048)

4. **응답 시간 최적화**
   - OCR 처리: 목표 2초 이내
   - Timeout: 10초
   - 비동기 처리 (Kafka/Redis Queue) 고려

5. **보안**
   - 업로드 이미지는 S3 임시 저장 (24시간 후 자동 삭제)
   - 개인정보(이름, 주민번호) 마스킹 처리
   - HTTPS 필수

---

**최종 수정일**: 2025-11-10
**작성자**: SilverCare 개발팀
**문의**: [issues.md](./issues.md) 참조
