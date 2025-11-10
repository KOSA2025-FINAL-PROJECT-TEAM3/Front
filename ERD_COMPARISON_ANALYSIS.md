# ERD Comparison Analysis

> Comprehensive comparison between DATABASE_ERD.dbml (current branch) and project requirements
>
> **Date**: 2025-11-10
> **Branch**: `claude/read-md-documentation-011CUyS1QctyAvmoMjok12i5`

---

## 📋 Executive Summary

This document compares the newly created `DATABASE_ERD.dbml` against the project specifications to identify:
1. ✅ **What's implemented** - Tables that exist in current ERD
2. ⚠️ **What's missing** - Tables needed for PROJECT_SPECIFICATION.md features
3. 🔄 **What needs merging** - Tables from .github ERD that should be included

---

## 🗂️ Current DATABASE_ERD.dbml Tables (18 tables)

### Authentication & Users (3 tables)
| Table | Purpose | Status |
|-------|---------|--------|
| `users` | User accounts with Kakao OAuth support | ✅ Complete |
| `oauth_providers` | Multi-provider OAuth (Kakao, Google, Naver) | ✅ Complete |
| `refresh_tokens` | JWT refresh token management (7-day expiry) | ✅ Complete |

**Key Features:**
- Kakao OAuth fields: `kakao_id`, `kakao_email`, `kakao_connected_at`
- Role-based access: `senior` | `guardian`
- Token security: SHA-256 hashing, device tracking, revocation support

---

### Family Network (2 tables)
| Table | Purpose | Status |
|-------|---------|--------|
| `family_groups` | Family care groups with Hocuspocus sync | ✅ Complete |
| `family_members` | N:M family membership with permissions | ✅ Complete |

**Key Features:**
- Real-time sync: `sync_document_id` for Hocuspocus
- Invitation workflow: `pending` → `accepted` → `declined`
- Granular permissions: `can_edit_medications`, `can_view_health_data`, `can_receive_alerts`
- Supports multi-role: `parent` | `child` | `guardian`

---

### Medication Management (4 tables)
| Table | Purpose | Status |
|-------|---------|--------|
| `medications` | User medications with OCR linkage | ✅ Complete |
| `medication_schedules` | Recurring medication schedule (time, days of week) | ✅ Complete |
| `medication_logs` | Medication adherence tracking | ✅ Complete |
| `drug_food_interactions` | Drug-food conflict database (50-100 entries) | ✅ Complete |

**Key Features:**
- OCR integration: `ocr_record_id` foreign key
- Rich medication data: ingredient, manufacturer, dosage, timing, warnings
- Inventory tracking: `total_quantity`, `remaining_quantity`, `expiry_date`
- Schedule flexibility: JSON `days_of_week`, `timing` (식전/식후/기상 시)
- Log statuses: `pending` | `completed` | `missed` | `skipped`
- Family confirmation: `confirmed_by`, `confirmed_at`

---

### Diet Management (2 tables)
| Table | Purpose | Status |
|-------|---------|--------|
| `diet_logs` | User meal records | ✅ Complete |
| `diet_warnings` | Drug-food conflict warnings | ✅ Complete |

**Key Features:**
- Meal types: `breakfast` | `lunch` | `dinner` | `snack`
- Photo support: `photo_url`
- Conflict detection: Links to `drug_food_interactions`
- Severity-based alerts: `높음` triggers family notification
- User acknowledgment tracking: `user_acknowledged`, `acknowledged_at`

---

### OCR & Prescription (1 table)
| Table | Purpose | Status |
|-------|---------|--------|
| `ocr_records` | OCR prescription recognition history | ✅ Complete |

**Key Features:**
- Multi-engine support: `google-vision` | `tesseract`
- Confidence-based workflow: `confidence_score >= 0.85` → auto-register, else manual verification
- Parsed data: JSON `ParsedMedication` object
- S3 image storage: `image_url` (24-hour retention)
- Bidirectional link: `medication_created`, `medication_id`

---

### Chat & Consultation (3 tables)
| Table | Purpose | Status |
|-------|---------|--------|
| `counselors` | Doctors and AI chatbots | ✅ Complete |
| `chat_rooms` | 1:1 consultation rooms | ✅ Complete |
| `chat_messages` | Chat message history | ✅ Complete |

**Key Features:**
- Dual counselor types: `doctor` | `ai_bot`
- Doctor metadata: `hospital_name`, `specialty`, `license_number`
- AI bot metadata: `ai_model`, `prompt_template`
- WebSocket support: Real-time messaging with `is_read` status
- AI response tracking: `ai_model`, `ai_response_time_ms`

---

### Notifications (1 table)
| Table | Purpose | Status |
|-------|---------|--------|
| `notifications` | User notifications | ✅ Complete |

**Key Features:**
- Multi-channel: `web` | `kakao_alimtalk` | `push`
- Rich types: `medication_reminder` | `missed_dose` | `family_alert` | `diet_warning` | `chat_message`
- Deep linking: `action_url`, `action_data`
- Entity polymorphism: `related_entity_type`, `related_entity_id`

---

### Reporting (1 table)
| Table | Purpose | Status |
|-------|---------|--------|
| `adherence_reports` | Medication adherence reports | ✅ Complete |

**Key Features:**
- Time-based reports: `start_date`, `end_date`
- Comprehensive metrics: `total_doses`, `completed_doses`, `missed_doses`, `adherence_rate`
- Breakdown: JSON `medication_breakdown`, `weekly_trend`
- PDF export: `pdf_url`, `pdf_generated_at`
- Family-level reports: `family_group_id`

---

### System (1 table)
| Table | Purpose | Status |
|-------|---------|--------|
| `audit_logs` | GDPR compliance audit trail | ✅ Complete |

**Key Features:**
- Action tracking: `create` | `update` | `delete` | `view`
- Change tracking: `old_value`, `new_value` (JSON)
- Request metadata: `ip_address`, `user_agent`
- Entity polymorphism: `entity_type`, `entity_id`

---

## ⚠️ Missing Tables (Based on PROJECT_SPECIFICATION.md)

### 1. Disease Management System

Based on FRONTEND_COMPONENTS_SPECIFICATION.md (lines 158-172), the project requires:

```
features/disease/
├── pages/
│   ├── SymptomSearchPage.jsx        → Requires: symptom_searches
│   ├── SuspectedDiseasePage.jsx     → Requires: suspected_diseases
│   ├── MyDiseasesPage.jsx           → Requires: user_diseases
│   ├── DiseaseRestrictionsPage.jsx  → Requires: disease_info
│   └── PharmacyAdvicePage.jsx       → Requires: hospital_diet_resources
```

**Missing Tables:**
| Table | Purpose | Priority |
|-------|---------|----------|
| `disease_info` | Disease master data (ICD-10 codes, symptoms, restrictions) | 🔴 HIGH |
| `symptom_searches` | User symptom search history | 🟡 MEDIUM |
| `suspected_diseases` | AI-suggested diseases from symptom search | 🟡 MEDIUM |
| `user_diseases` | User's diagnosed diseases | 🔴 HIGH |
| `disease_restrictions` | Food/drug restrictions per disease | 🔴 HIGH |
| `hospital_diet_resources` | Hospital diet guidelines | 🟢 LOW |

**Rationale:**
- Disease management is a **core feature** mentioned in PROJECT_SPECIFICATION.md
- `user_diseases` is critical for personalized drug-food conflict warnings
- Links to medication contraindications (e.g., diabetic patients can't take certain drugs)

---

### 2. Medication Reviews & Social Features

Based on FRONTEND_COMPONENTS_SPECIFICATION.md (line 120):
```
MedicationReviewsPage.jsx → Requires: medication_reviews
```

**Missing Table:**
| Table | Purpose | Priority |
|-------|---------|----------|
| `medication_reviews` | User reviews/ratings for medications | 🟢 LOW |

**Rationale:**
- Social proof for medication effectiveness
- Side effect sharing between users
- Low priority (Nice-to-have, not MVP)

---

### 3. Pharmacy & Location Services

Based on PROJECT_SPECIFICATION.md (lines 1574-1575):
> ❌ 근처 약국 찾기 - Google Maps API만 붙이면 됨 (우선순위 낮음)

**Missing Table:**
| Table | Purpose | Priority |
|-------|---------|----------|
| `pharmacies` | Pharmacy locations, hours, contact | 🟢 VERY LOW |

**Rationale:**
- Explicitly marked as **low priority** in spec
- Can be implemented later without schema change
- Google Places API can handle this externally

---

## 🔄 Recommended Merged ERD Structure

### Phase 1: Add Missing Critical Tables (Week 1-2)

```sql
-- Disease Management (Critical for MVP)

Table disease_info {
  id bigint [pk, increment]
  icd10_code varchar(10) [unique, note: 'ICD-10 질병 코드']
  name_ko varchar(255) [not null, note: '한글 질병명']
  name_en varchar(255)
  category varchar(100) [note: '대분류 (순환계, 내분비계 등)']
  symptoms json [note: '주요 증상 배열']
  description text

  created_at timestamp [default: `now()`]

  Indexes {
    icd10_code
    name_ko
    category
  }

  Note: '질병 정보 마스터 DB (500-1000개 주요 질병)'
}

Table user_diseases {
  id bigint [pk, increment]
  user_id bigint [ref: > users.id, not null]
  disease_id bigint [ref: > disease_info.id, not null]

  // 진단 정보
  diagnosed_date date [note: '진단일']
  severity varchar(20) [note: '경증 | 중등증 | 중증']
  notes text [note: '의사 소견, 메모']

  // 상태
  is_active boolean [default: true, note: '치료 중 여부']
  recovered_date date

  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  Indexes {
    user_id
    disease_id
    (user_id, is_active)
  }

  Note: '사용자별 진단받은 질병'
}

Table disease_restrictions {
  id bigint [pk, increment]
  disease_id bigint [ref: > disease_info.id, not null]

  // 제한 사항
  restriction_type varchar(50) [not null, note: 'food | drug | activity']
  restriction_name varchar(255) [not null]
  reason text [not null]
  severity varchar(20) [note: '높음 | 중간 | 낮음']
  alternatives json

  source varchar(500)
  created_at timestamp [default: `now()`]

  Indexes {
    disease_id
    restriction_type
  }

  Note: '질병별 음식/약물/활동 제한사항'
}

// 예시: 당뇨병 환자는 고당분 음식 제한, 특정 혈압약 금기
```

---

### Phase 2: Add Optional Tables (Week 3+)

```sql
-- Symptom Search & AI Diagnosis

Table symptom_searches {
  id bigint [pk, increment]
  user_id bigint [ref: > users.id, not null]

  symptoms json [not null, note: '입력한 증상 배열']
  search_query text

  created_at timestamp [default: `now()`]

  Indexes {
    user_id
    created_at
  }

  Note: '증상 검색 이력 (AI 진단 인풋)'
}

Table suspected_diseases {
  id bigint [pk, increment]
  search_id bigint [ref: > symptom_searches.id, not null]
  disease_id bigint [ref: > disease_info.id, not null]

  confidence_score decimal(3,2) [note: 'AI 예측 신뢰도 0.00~1.00']
  matched_symptoms json [note: '매칭된 증상 배열']

  created_at timestamp [default: `now()`]

  Indexes {
    search_id
    (disease_id, confidence_score)
  }

  Note: 'AI 추천 의심 질병 (증상 기반)'
}

-- Hospital Diet Resources (Low Priority)

Table hospital_diet_resources {
  id bigint [pk, increment]
  disease_id bigint [ref: > disease_info.id]

  title varchar(255) [not null]
  content text [not null]
  hospital_name varchar(255)
  pdf_url text

  created_at timestamp [default: `now()`]

  Indexes {
    disease_id
  }

  Note: '병원 식단 가이드 리소스 (당뇨병 식이요법 등)'
}

-- Medication Reviews (Social Feature)

Table medication_reviews {
  id bigint [pk, increment]
  medication_id bigint [ref: > medications.id, not null]
  user_id bigint [ref: > users.id, not null]

  rating int [not null, note: '1-5점']
  effectiveness int [note: '효과 1-5점']
  side_effects json [note: '경험한 부작용 배열']
  comment text

  helpful_count int [default: 0]

  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  Indexes {
    medication_id
    user_id
    (medication_id, rating)
  }

  Note: '약물 사용 후기 (커뮤니티 기능)'
}
```

---

## 📊 Feature Coverage Matrix

| Feature (PROJECT_SPECIFICATION.md) | Current ERD Support | Missing Tables | Priority |
|------------------------------------|---------------------|----------------|----------|
| **Kakao OAuth Login** | ✅ Full | - | - |
| **Family Care Network** | ✅ Full (Hocuspocus ready) | - | - |
| **Medication CRUD** | ✅ Full | - | - |
| **Medication Schedules** | ✅ Full (recurring, time-based) | - | - |
| **Drug-Food Interaction Warnings** | ✅ Full (50-100 conflicts) | - | - |
| **OCR Prescription Scan** | ✅ Full (Google Vision + Tesseract) | - | - |
| **Pill Reverse Search** | ⚠️ Partial (식약처 API, no table) | - | 🟡 API-based (no storage needed) |
| **Chat with Doctor/AI Bot** | ✅ Full (WebSocket ready) | - | - |
| **Adherence Reports (PDF)** | ✅ Full | - | - |
| **Notifications (Web + KakaoTalk)** | ✅ Full | - | - |
| **Disease Management** | ❌ Missing | `disease_info`, `user_diseases`, `disease_restrictions` | 🔴 HIGH |
| **Symptom Search (AI)** | ❌ Missing | `symptom_searches`, `suspected_diseases` | 🟡 MEDIUM |
| **Hospital Diet Resources** | ❌ Missing | `hospital_diet_resources` | 🟢 LOW |
| **Medication Reviews** | ❌ Missing | `medication_reviews` | 🟢 LOW |

---

## 🚀 Implementation Recommendations

### Immediate Actions (This Week)

1. **Add Disease Management Tables** (Priority: 🔴 HIGH)
   ```bash
   # Add to DATABASE_ERD.dbml:
   - disease_info (500-1000 diseases with ICD-10 codes)
   - user_diseases (user's diagnosed conditions)
   - disease_restrictions (food/drug restrictions per disease)
   ```

   **Rationale:**
   - Required for `MyDiseasesPage.jsx`, `DiseaseRestrictionsPage.jsx`
   - Enhances drug-food conflict warnings (e.g., diabetic patients + high-sugar foods)
   - Links to medication contraindications

2. **Update `diet_warnings` Logic**
   ```javascript
   // After adding user_diseases table:
   const checkConflicts = (userId, foodName) => {
     // 1. Check drug-food interactions (EXISTING)
     const drugConflicts = checkDrugFoodConflicts(userId, foodName);

     // 2. Check disease restrictions (NEW)
     const diseaseConflicts = checkDiseaseRestrictions(userId, foodName);

     return [...drugConflicts, ...diseaseConflicts];
   };
   ```

---

### Phase 2 (Week 3-4)

3. **Add Symptom Search Tables** (Priority: 🟡 MEDIUM)
   ```bash
   - symptom_searches
   - suspected_diseases
   ```

   **Rationale:**
   - Enables AI-powered symptom diagnosis
   - Differentiates from competitors (참신한 기능)
   - Can use OpenAI/Claude for symptom → disease matching

4. **Consider Medication Reviews** (Priority: 🟢 LOW)
   - Only if time permits
   - Social feature for community building
   - Not critical for MVP

---

### Not Recommended

5. **Skip `pharmacies` Table**
   - Use Google Places API directly
   - No need for local storage
   - Reduces maintenance burden

6. **Skip `hospital_diet_resources` for Now**
   - Low priority per spec
   - Can be added later as PDF links without schema change

---

## 🔗 Cross-Table Relationships

### New Relationships After Adding Disease Tables

```dbml
// Medication contraindications for diseases
Ref: medications.user_id > user_diseases.user_id
// "당뇨병 환자는 특정 혈압약 금기"

// Disease-based diet restrictions
Ref: diet_warnings.user_id > user_diseases.user_id
// "당뇨병 환자가 고당분 음식 섭취 시 경고"

// AI symptom diagnosis
Ref: symptom_searches.user_id > users.id
Ref: suspected_diseases.search_id > symptom_searches.id
Ref: suspected_diseases.disease_id > disease_info.id
```

---

## 📝 Summary & Next Steps

### ✅ Current ERD Strengths
- **18 tables** covering 80% of MVP features
- **Kakao OAuth** fully implemented
- **Family care network** with Hocuspocus sync ready
- **Chat feature** with doctor/AI bot support
- **OCR integration** with confidence-based workflow
- **Comprehensive medication management** (CRUD, schedules, logs, interactions)

### ⚠️ Critical Gaps
- **Disease management system** (3 tables needed)
- **Symptom search & AI diagnosis** (2 tables, optional)

### 🎯 Recommended Actions
1. **Merge disease tables** into `DATABASE_ERD.dbml` (HIGH priority)
2. **Update dbdiagram.io** with merged ERD
3. **Validate with backend team** for API alignment
4. **Defer optional tables** (`medication_reviews`, `hospital_diet_resources`) to Phase 2

---

**Analysis Date**: 2025-11-10
**Branch**: `claude/read-md-documentation-011CUyS1QctyAvmoMjok12i5`
**Files Analyzed**:
- `DATABASE_ERD.dbml` (657 lines, 18 tables)
- `PROJECT_SPECIFICATION.md` (2,000+ lines)
- `FRONTEND_COMPONENTS_SPECIFICATION.md` (500+ lines)
- `CHAT_API_SPECIFICATION.md` (797 lines)
- `OCR_API_SPECIFICATION.md` (837 lines)
