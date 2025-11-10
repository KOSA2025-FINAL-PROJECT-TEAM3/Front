# DATABASE_ERD_V3.dbml Summary

> **Version C** - Complete database schema designed from scratch
> 
> **Created**: 2025-11-10
> 
> **Purpose**: 3-way comparison - comprehensive ERD supporting ALL features

---

## 📊 Overview

- **Total Tables**: 26
- **Lines of Code**: 1,197
- **Database**: PostgreSQL
- **Coverage**: 100% of PROJECT_SPECIFICATION.md + FRONTEND_COMPONENTS_SPECIFICATION.md

---

## 🎯 Feature Coverage

### ✅ Authentication & Authorization (3 tables)
1. **users** - Kakao OAuth, role selection, notification settings
2. **oauth_providers** - Multi-provider OAuth (Kakao, Google, Naver)
3. **refresh_tokens** - JWT token management, multi-device support

**Pages Supported**: KakaoLoginPage, RoleSelectionPage, ProfileEditPage, NotificationSettingsPage

---

### ✅ Family Care Network (2 tables)
4. **family_groups** - Hocuspocus real-time sync, invite codes
5. **family_members** - Granular permissions, invitation workflow

**Pages Supported**: FamilyManagementPage, FamilyMemberDetailPage, FamilyInvitePage

**Key Features**:
- Real-time medication sync via Hocuspocus (`sync_document_id`)
- 4 permission levels: edit medications, view health data, receive alerts, manage family
- Invitation workflow: pending → accepted → declined

---

### ✅ Medication Management (4 tables)
6. **medications** - Complete drug info, inventory tracking, OCR link
7. **medication_schedules** - Flexible scheduling, smart reminders
8. **medication_logs** - Adherence tracking, family confirmation
9. **medication_reviews** - Community reviews & ratings

**Pages Supported**: 
- MedicationListPage
- MedicationAddPage  
- MedicationDetailPage
- MedicationReviewsPage
- TodayMedicationChecklist (component)
- MedicationScheduleTimeline (component)

**Key Features**:
- Low stock alerts (`low_stock_threshold`)
- Expiry date tracking
- OCR integration (`ocr_record_id`)
- Family member confirmation (`confirmed_by`)
- Multi-reminder system (repeat interval, max repeats)

---

### ✅ Drug-Food Interactions (3 tables)
10. **drug_food_interactions** - 50-100 conflict rules database
11. **diet_logs** - Meal tracking with photos
12. **diet_warnings** - Real-time conflict alerts, family notifications

**Pages Supported**: DietLogPage, FoodWarningPage, AvoidFoodList (component)

**Key Features**:
- 3 severity levels: 높음 | 중간 | 낮음
- Alternative food suggestions
- Automatic family alerts for high-severity warnings
- Evidence-based source tracking

---

### ✅ Disease Management (3 tables)
13. **disease_info** - ICD-10 disease master DB (500-1000 diseases)
14. **user_diseases** - User diagnosis history
15. **disease_restrictions** - Unified restrictions (food, ingredients, medications, activities)

**Pages Supported**: MyDiseasesPage, DiseaseRestrictionsPage, DiseaseList (component)

**Key Features**:
- ICD-10 standard codes
- Comprehensive disease information (symptoms, causes, treatments)
- Unified restriction table (replaces 3 separate tables from Version A)
- Chronic disease tracking

---

### ✅ Symptom Search & AI Diagnosis (2 tables)
16. **symptom_searches** - Natural language symptom input
17. **suspected_diseases** - AI-powered disease predictions

**Pages Supported**: SymptomSearchPage, SuspectedDiseasePage

**Key Features**:
- AI model integration (GPT-4, Claude-3)
- Confidence scoring (0-100%)
- Urgency levels (low → emergency)
- Pharmacist advice recommendations

---

### ✅ Pharmacy & Consultation (4 tables)
18. **pharmacies** - Local pharmacy database with GIS
19. **counselors** - Pharmacists, doctors, AI chatbots
20. **chat_rooms** - 1:1 consultation rooms
21. **chat_messages** - WebSocket real-time messaging

**Pages Supported**: 
- PharmacyAdvicePage
- PharmacistChatListPage
- ChatConversationPage

**Key Features**:
- GIS-based pharmacy search (latitude, longitude indexes)
- Hybrid counselors: human pharmacists/doctors + AI chatbots
- Real-time chat with read receipts
- AI metadata tracking (model, confidence, response time)

---

### ✅ OCR Prescription Scan (1 table)
22. **ocr_records** - Google Vision + Tesseract fallback

**Pages Supported**: PrescriptionScanPage, OCRResultPage

**Key Features**:
- Dual-engine OCR (Google Vision primary, Tesseract fallback)
- Confidence scoring & manual verification workflow
- User corrections tracking
- Automatic medication creation linkage

---

### ✅ Hospital Diet Resources (1 table)
23. **hospital_diet_resources** - Official hospital diet guidelines

**Pages Supported**: HospitalDietResourcesPage

**Key Features**:
- Multi-format support (PDF, web, video)
- Disease-specific categorization (당뇨, 고혈압, 신장질환)
- Download tracking

---

### ✅ Notifications (1 table)
24. **notifications** - Multi-channel alerts

**Pages Supported**: NotificationListPage, NotificationDetailPage, NotificationBell (component)

**Key Features**:
- 7 notification types (medication_reminder, missed_dose, family_alert, diet_warning, chat_message, low_stock, expiring_soon)
- Multi-channel delivery (web, Kakao alimtalk, push, SMS, email)
- Priority levels (low → urgent)
- Actionable notifications with buttons

---

### ✅ Adherence Reports (1 table)
25. **adherence_reports** - PDF export for doctors

**Pages Supported**: AdherenceReportPage, WeeklyAdherenceChart (component)

**Key Features**:
- Personal & family group reports
- Time-of-day analysis (morning, afternoon, evening, night)
- Weekly trend tracking
- Medication-level breakdown
- PDF generation & doctor sharing

---

### ✅ Audit Logs (1 table)
26. **audit_logs** - GDPR compliance

**Pages Supported**: SettingsPage (privacy section)

**Key Features**:
- Complete audit trail (CRUD operations)
- Security event tracking
- IP address & device fingerprinting
- Suspicious activity detection

---

## 🔗 Relationship Summary

### Total References: 68 foreign keys

**Core Relationships**:
- `users` ← 19 tables depend on users
- `medications` ← 5 tables reference medications
- `family_groups` ← 3 tables for family features
- `disease_info` ← 3 tables for disease management

**Cascade Delete Strategy**:
- User deletion → cascades to all user data (GDPR right to be forgotten)
- Family group deletion → removes all members & permissions
- Medication deletion → cascades to schedules, logs, reviews
- Chat room deletion → removes all messages

---

## 📈 Index Strategy

### Total Indexes: 150+

**Primary Indexes**:
1. **All foreign keys** (68 FK indexes)
2. **Authentication**: email, kakao_id, phone (3 unique indexes)
3. **Time-series**: created_at, scheduled_time, meal_time (15+ indexes)
4. **Search**: name, title, disease_name (10+ full-text ready)
5. **Compound**: (user_id, created_at), (user_id, is_active) (30+ composite)
6. **GIS**: (latitude, longitude) for pharmacy search

**Performance Optimization**:
- Partitioning ready: `user_id` for horizontal scaling
- Read replica ready: Reports can use separate DB instance
- Caching strategy: Redis for frequently accessed data (users, medications, notifications)

---

## 🔒 Security Features

### Data Protection
1. **Encryption**:
   - `password_hash`: BCrypt (saltRounds: 10)
   - `access_token`, `refresh_token`: AES-256
   - Sensitive fields marked for encryption at application layer

2. **GDPR Compliance**:
   - `audit_logs`: Complete access trail
   - Cascade delete: User deletion removes all personal data
   - Data export: JSON export functionality ready
   - Consent tracking: OAuth consent timestamps

3. **SQL Injection Prevention**:
   - All queries use Prepared Statements (Spring JPA)
   - Input validation at API layer

4. **XSS Prevention**:
   - Frontend sanitization (DOMPurify)
   - Backend HTML entity encoding

---

## 🚀 Scalability Considerations

### Sharding Strategy
- **Partition key**: `user_id`
- **Estimated rows**: 10K users × 50 medications = 500K medication records
- **Growth**: Linear scaling with user base

### Caching Strategy (Redis)
```
Cache Keys:
- user:{id} → User profile (TTL: 1 hour)
- medications:{user_id} → User medications (TTL: 30 min)
- family:{group_id} → Family members (TTL: 1 hour)
- notifications:{user_id}:unread → Unread count (TTL: 5 min)
```

### Query Optimization
1. **Medication logs**: Partition by month (`scheduled_time`)
2. **Audit logs**: Archive to cold storage after 90 days
3. **Notifications**: Auto-delete after 30 days (`expires_at`)

---

## 📋 Comparison with Other Versions

| Feature | Version A (.github) | Version B (Current) | Version C (This) |
|---------|---------------------|---------------------|------------------|
| **Tables** | ~18 | 18 | **26** |
| **Kakao OAuth** | ❌ | ✅ | ✅ |
| **JWT Tokens** | ❌ | ✅ | ✅ |
| **Drug-Food Interactions** | ❌ | ✅ | ✅ |
| **OCR** | ❌ | ✅ | ✅ |
| **Chat** | ❌ | ✅ | ✅ |
| **Disease Management** | ✅ | ❌ | ✅ |
| **Symptom Search** | ✅ | ❌ | ✅ |
| **Medication Reviews** | ✅ | ❌ | ✅ |
| **Hospital Diet Resources** | ✅ | ❌ | ✅ |
| **Adherence Reports** | ❌ | ✅ | ✅ |
| **Audit Logs** | ❌ | ✅ | ✅ |
| **GIS Pharmacy Search** | ❌ | ❌ | ✅ |
| **Feature Coverage** | 60% | 80% | **100%** |

---

## ✅ Page Support Matrix

### All 34 Pages from FRONTEND_COMPONENTS_SPECIFICATION.md

| # | Page | Supported Tables |
|---|------|------------------|
| 1 | KakaoLoginPage | users, oauth_providers |
| 2 | RoleSelectionPage | users |
| 3 | SeniorDashboard | medications, medication_logs, diet_logs, user_diseases |
| 4 | CaregiverDashboard | family_members, medication_logs, notifications |
| 5 | MedicationListPage | medications |
| 6 | MedicationAddPage | medications, ocr_records |
| 7 | FamilyManagementPage | family_groups, family_members |
| 8 | SettingsPage | users, notifications |
| 9 | PharmacistChatListPage | chat_rooms, counselors |
| 10 | ChatConversationPage | chat_messages |
| 11 | SymptomSearchPage | symptom_searches |
| 12 | SuspectedDiseasePage | suspected_diseases, disease_info |
| 13 | PharmacyAdvicePage | pharmacies, counselors |
| 14 | PillSearchPage | medications (식약처 API) |
| 15 | PillResultPage | medications |
| 16 | PillDetailModal | medications, drug_food_interactions |
| 17 | MedicationReviewsPage | medication_reviews |
| 18 | MedicationDetailPage | medications, medication_schedules |
| 19 | MyDiseasesPage | user_diseases, disease_info |
| 20 | DiseaseRestrictionsPage | disease_restrictions |
| 21 | DietLogPage | diet_logs |
| 22 | FoodWarningPage | diet_warnings, drug_food_interactions |
| 23 | AdherenceReportPage | adherence_reports |
| 24 | HospitalDietResourcesPage | hospital_diet_resources |
| 25 | FamilyInvitePage | family_members |
| 26 | FamilyMemberDetailPage | family_members, medications |
| 27 | PrescriptionScanPage | ocr_records |
| 28 | OCRResultPage | ocr_records, medications |
| 29 | NotificationListPage | notifications |
| 30 | NotificationDetailPage | notifications |
| 31 | ProfileEditPage | users |
| 32 | NotificationSettingsPage | users |
| 33 | MyMedicationsSettingsPage | medications |
| 34 | MyDiseasesSettingsPage | user_diseases |

**Coverage**: 34/34 pages (100%) ✅

---

## 🎯 Key Improvements Over Previous Versions

### 1. Complete Feature Set
- **Version A**: Missing OAuth, OCR, Chat, Reports
- **Version B**: Missing Disease Management, Symptom Search
- **Version C**: **ALL features included**

### 2. Enhanced Tables
- **users**: Added notification preferences (4 toggles)
- **family_members**: 4 granular permissions vs 2
- **medication_logs**: Added photo proof, location tracking
- **notifications**: 7 types vs 5, multi-channel delivery
- **adherence_reports**: Time-of-day analysis, problem identification

### 3. New Tables (Not in A or B)
- **pharmacies**: GIS-based search (latitude, longitude)
- **hospital_diet_resources**: Official guidelines
- **medication_reviews**: Social proof

### 4. Better Normalization
- **disease_restrictions**: 1 unified table vs 3 separate (Version A)
- **counselors**: Supports pharmacists, doctors, AND AI bots

### 5. Production-Ready Features
- Multi-device token management
- Audit logs for GDPR
- Cascade delete strategies
- Soft delete support (`is_active` flags)
- Comprehensive indexing (150+ indexes)

---

## 📝 Usage Instructions

### 1. Visualize on dbdiagram.io
```bash
# Copy contents of DATABASE_ERD_V3.dbml
# Paste into https://dbdiagram.io/d
# View interactive diagram
```

### 2. Export to SQL
```bash
# dbdiagram.io → Export → PostgreSQL
# Generates CREATE TABLE statements
# Includes all foreign keys & indexes
```

### 3. Spring Boot Integration
```java
// Use JPA entities matching table structure
// Reference tables:
// - User.java → users table
// - Medication.java → medications table
// - etc.
```

---

## 🔮 Future Extensibility

### Phase 2 Expansions (Optional)
1. **Wearable Integration**: Add `wearable_devices` table
2. **Medication Reminders**: Add `reminder_logs` table
3. **Insurance Claims**: Add `insurance_claims` table
4. **Telehealth Video**: Add `video_consultations` table

### Schema Migration Strategy
- Use Flyway or Liquibase for version control
- Backward-compatible migrations only
- Blue-green deployment for zero downtime

---

## 📞 Support

**Files**:
- Main schema: `/home/user/Front/DATABASE_ERD_V3.dbml`
- This summary: `/home/user/Front/DATABASE_ERD_V3_SUMMARY.md`

**Related Documents**:
- PROJECT_SPECIFICATION.md (feature requirements)
- FRONTEND_COMPONENTS_SPECIFICATION.md (page specifications)
- ERD_THREE_WAY_COMPARISON.md (comparison analysis)

---

**Last Updated**: 2025-11-10
**Version**: 3.0 (Version C)
**Status**: ✅ Complete - Ready for 3-way comparison
