# 가족 초대 기능 백엔드 API 명세서

## 개요

이 문서는 프론트엔드에서 필요로 하는 가족 초대 관련 백엔드 API 명세입니다.
초대 코드 기반의 가족 초대 흐름을 지원합니다.

## 흐름도

```
[초대자 - 로그인 필요]
1. 가족 그룹 생성/선택
2. POST /family/invite → 초대 생성 → 6자리 shortCode 발급
3. shortCode를 초대 대상에게 전달 (카톡, 문자 등)

[초대 대상자 - 로그인 불필요]
4. /invite/enter 페이지 접속
5. shortCode 입력
6. GET /invite/info?code={shortCode} → 초대 정보 조회 (공개 API)
7. 초대 정보 확인 (그룹명, 초대자, 역할)

[초대 대상자 - 로그인 필요]
8. 로그인/회원가입
9. POST /family/invite/accept → 초대 수락
10. 가족 그룹에 합류 완료
```

---

## API 명세

### 1. 초대 정보 조회 (공개 API)

초대 코드로 초대 정보를 조회합니다. **인증 불필요**.

```
GET /invite/info?code={shortCode}
```

#### Request

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| code      | String | Yes      | 6자리 초대 코드    |

#### Response (200 OK)

```json
{
  "shortCode": "ABC123",
  "groupId": 1,
  "groupName": "우리 가족",
  "inviterName": "김철수",
  "inviterEmail": "kim@example.com",
  "suggestedRole": "SENIOR",
  "expiresAt": "2025-11-25T12:00:00Z",
  "status": "PENDING"
}
```

#### Response Fields

| Field         | Type   | Description                          |
|---------------|--------|--------------------------------------|
| shortCode     | String | 6자리 초대 코드                      |
| groupId       | Long   | 가족 그룹 ID                         |
| groupName     | String | 가족 그룹 이름                       |
| inviterName   | String | 초대한 사람 이름                     |
| inviterEmail  | String | 초대한 사람 이메일 (선택적)          |
| suggestedRole | String | 제안된 역할 (`SENIOR` or `CAREGIVER`)|
| expiresAt     | String | 만료 시간 (ISO 8601)                 |
| status        | String | 초대 상태 (`PENDING`, `ACCEPTED`, `EXPIRED`) |

#### Error Responses

| Status | Code           | Description                |
|--------|----------------|----------------------------|
| 400    | INVALID_CODE   | 잘못된 형식의 코드         |
| 404    | NOT_FOUND      | 존재하지 않는 초대 코드    |
| 410    | EXPIRED        | 만료된 초대 코드           |

---

### 2. 초대 생성 (인증 필요)

새로운 초대를 생성합니다. 로그인 필요.

```
POST /family/invite
```

#### Request Headers

```
Authorization: Bearer {accessToken}
```

#### Request Body

```json
{
  "groupId": 1,
  "name": "김시니어",
  "email": "senior@example.com",
  "role": "SENIOR"
}
```

#### Request Fields

| Field   | Type   | Required | Description                          |
|---------|--------|----------|--------------------------------------|
| groupId | Long   | Yes      | 가족 그룹 ID                         |
| name    | String | Yes      | 초대할 사람 이름 (표시용)            |
| email   | String | No       | 초대할 사람 이메일 (선택)            |
| role    | String | Yes      | 제안 역할 (`SENIOR` or `CAREGIVER`)  |

#### Response (201 Created)

```json
{
  "id": 123,
  "shortCode": "ABC123",
  "longToken": "uuid-v4-long-token-here",
  "inviteLink": "https://amapill.com/invite/enter?code=ABC123",
  "groupId": 1,
  "groupName": "우리 가족",
  "inviteeName": "김시니어",
  "inviteeEmail": "senior@example.com",
  "suggestedRole": "SENIOR",
  "expiresAt": "2025-11-25T12:00:00Z",
  "createdAt": "2025-11-24T12:00:00Z"
}
```

#### Response Fields

| Field         | Type   | Description                          |
|---------------|--------|--------------------------------------|
| id            | Long   | 초대 ID                              |
| shortCode     | String | 6자리 초대 코드 (수동 입력용)        |
| longToken     | String | 긴 토큰 (URL 직접 접근용)            |
| inviteLink    | String | 초대 링크 (shortCode 포함)           |
| groupId       | Long   | 가족 그룹 ID                         |
| groupName     | String | 가족 그룹 이름                       |
| inviteeName   | String | 초대 대상 이름                       |
| inviteeEmail  | String | 초대 대상 이메일 (nullable)          |
| suggestedRole | String | 제안된 역할                          |
| expiresAt     | String | 만료 시간 (기본 24시간 후)           |
| createdAt     | String | 생성 시간                            |

---

### 3. 초대 수락 (인증 필요)

초대를 수락하고 가족 그룹에 합류합니다. 로그인 필요.

```
POST /family/invite/accept
```

#### Request Headers

```
Authorization: Bearer {accessToken}
```

#### Request Body

```json
{
  "inviteCode": "ABC123"
}
```

#### Request Fields

| Field      | Type   | Required | Description     |
|------------|--------|----------|-----------------|
| inviteCode | String | Yes      | 6자리 초대 코드 |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "가족 그룹에 합류했습니다.",
  "groupId": 1,
  "groupName": "우리 가족",
  "memberId": 456,
  "role": "SENIOR",
  "joinedAt": "2025-11-24T13:00:00Z"
}
```

#### Error Responses

| Status | Code              | Description                    |
|--------|-------------------|--------------------------------|
| 400    | INVALID_CODE      | 잘못된 형식의 코드             |
| 401    | UNAUTHORIZED      | 로그인 필요                    |
| 404    | NOT_FOUND         | 존재하지 않는 초대 코드        |
| 409    | ALREADY_MEMBER    | 이미 해당 가족의 구성원        |
| 410    | EXPIRED           | 만료된 초대 코드               |

---

### 4. 초대 시작 - 긴 토큰용 (공개 API)

긴 토큰으로 초대 페이지에 접근 시 사용. **인증 불필요**.

> 기존 PublicInviteController의 `/invite/start` 엔드포인트

```
GET /invite/start?token={longToken}
```

#### Response

`GET /invite/info` 응답과 동일

---

## 데이터베이스 스키마 (제안)

### invitation 테이블

```sql
CREATE TABLE invitation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(6) NOT NULL UNIQUE,
    long_token VARCHAR(255) NOT NULL UNIQUE,
    family_group_id BIGINT NOT NULL,
    inviter_id BIGINT NOT NULL,
    invitee_name VARCHAR(100),
    invitee_email VARCHAR(255),
    suggested_role VARCHAR(20) NOT NULL DEFAULT 'SENIOR',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    accepted_by BIGINT,

    FOREIGN KEY (family_group_id) REFERENCES family_group(id),
    FOREIGN KEY (inviter_id) REFERENCES customer(id),
    FOREIGN KEY (accepted_by) REFERENCES customer(id),

    INDEX idx_short_code (short_code),
    INDEX idx_long_token (long_token),
    INDEX idx_status_expires (status, expires_at)
);
```

### 초대 코드 생성 로직

```java
// 6자리 영숫자 코드 생성 (대문자 + 숫자)
public String generateShortCode() {
    String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    SecureRandom random = new SecureRandom();
    StringBuilder code = new StringBuilder(6);

    for (int i = 0; i < 6; i++) {
        code.append(chars.charAt(random.nextInt(chars.length())));
    }

    // 중복 체크 후 재생성 필요
    return code.toString();
}
```

---

## 구현 체크리스트

### 필수 구현

- [ ] `GET /invite/info?code={shortCode}` - 공개 API, 초대 정보 조회
- [ ] `POST /family/invite` - 초대 생성 (shortCode 발급)
- [ ] `POST /family/invite/accept` - 초대 수락

### 선택 구현

- [ ] `GET /invite/start?token={longToken}` - 긴 토큰으로 초대 정보 조회
- [ ] `DELETE /family/invites/{id}` - 초대 취소
- [ ] `GET /family/invites` - 보낸/받은 초대 목록 조회

### 보안 고려사항

1. **shortCode 유추 방지**: 6자리 영숫자 = 약 21억 조합, 브루트포스 방지를 위해 rate limiting 필요
2. **만료 시간**: 기본 24시간, 필요시 조정 가능
3. **1회 사용**: 초대 수락 후 status를 ACCEPTED로 변경
4. **공개 API 주의**: `/invite/info`는 코드만 알면 정보 노출됨, 민감 정보 최소화

---

## 프론트엔드 연동 정보

### 사용하는 API 클라이언트

```javascript
// 공개 API (인증 불필요)
import { inviteApiClient } from '@core/services/api/inviteApiClient'

inviteApiClient.getInviteInfo(code)  // GET /invite/info?code=
inviteApiClient.startInvite(token)   // GET /invite/start?token=

// 인증 필요 API
import { familyApiClient } from '@core/services/api/familyApiClient'

familyApiClient.inviteMember(payload)  // POST /family/invite
familyApiClient.acceptInvite(code)     // POST /family/invite/accept
```

### 프론트엔드 페이지

| 경로              | 설명                     | 인증 필요 |
|-------------------|--------------------------|-----------|
| `/invite/enter`   | 초대 코드 입력 페이지    | No        |
| `/family/invite`  | 초대 관리 페이지         | Yes       |
| `/family`         | 가족 관리 페이지         | Yes       |

---

## 기존 백엔드 코드 참고

현재 존재하는 컨트롤러:

1. **PublicInviteController** (`/invite`)
   - `GET /invite/start?token={token}` - 긴 토큰용

2. **FamilyInviteController** (`/family/invite`)
   - `POST /family/invite` - 초대 생성
   - `POST /family/invite/accept` - 초대 수락

### 추가 필요 사항

`PublicInviteController`에 아래 엔드포인트 추가 필요:

```java
@GetMapping("/info")
public ResponseEntity<InviteInfoResponse> getInviteInfo(
    @RequestParam("code") String shortCode
) {
    InviteInfoResponse info = invitationService.getInviteInfo(shortCode);
    return ResponseEntity.ok(info);
}
```

---

## 문의

프론트엔드 담당자에게 문의해주세요.
