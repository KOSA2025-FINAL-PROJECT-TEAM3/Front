-- ============================================
-- 실버케어 (SilverCare) - MySQL Database Schema
-- 가족 돌봄 네트워크 기반 약 관리 플랫폼
-- Generated: 2025-11-05
-- ============================================

-- 데이터베이스 생성 및 설정
CREATE DATABASE IF NOT EXISTS silvercare
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE silvercare;

-- ============================================
-- 사용자 및 가족 관리
-- ============================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('senior', 'caregiver') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='사용자 정보 테이블';

CREATE TABLE family_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='가족 그룹 테이블';

CREATE TABLE family_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_group_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('parent', 'child') NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_group_id) REFERENCES family_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_family_user (family_group_id, user_id),
  INDEX idx_family_group (family_group_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='가족 구성원 매핑 테이블';

-- ============================================
-- 약 관리
-- ============================================

CREATE TABLE medications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  ingredient VARCHAR(255),
  dosage VARCHAR(100),
  timing VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE,
  quantity INT,
  remaining INT,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_name (name),
  INDEX idx_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='사용자별 약 정보';

CREATE TABLE medication_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medication_id INT NOT NULL,
  time TIME NOT NULL,
  days_of_week VARCHAR(20) COMMENT '0=일요일,1=월요일,...,6=토요일 (예: "1,3,5")',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
  INDEX idx_medication_id (medication_id),
  INDEX idx_time (time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='약 복용 일정';

CREATE TABLE medication_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medication_id INT NOT NULL,
  user_id INT NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  completed_time TIMESTAMP NULL,
  completed BOOLEAN DEFAULT FALSE,
  missed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_medication_id (medication_id),
  INDEX idx_user_id (user_id),
  INDEX idx_scheduled_time (scheduled_time),
  INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='약 복용 기록';

-- ============================================
-- 약-음식 상호작용 (차별화 기능)
-- ============================================

CREATE TABLE drug_food_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drug_name VARCHAR(255) NOT NULL,
  drug_ingredient VARCHAR(255),
  food_name VARCHAR(255) NOT NULL,
  food_category VARCHAR(100),
  conflict_ingredient VARCHAR(255),
  reason TEXT,
  severity ENUM('높음', '중간', '낮음') NOT NULL,
  alternatives TEXT COMMENT 'JSON 형식으로 대체 음식 리스트 저장',
  source VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_drug_name (drug_name),
  INDEX idx_food_name (food_name),
  INDEX idx_drug_ingredient (drug_ingredient),
  INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='약-음식 충돌 정보 (룰 베이스 시스템)';

-- ============================================
-- 식단 관리
-- ============================================

CREATE TABLE diet_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  calories INT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_recorded_at (recorded_at),
  INDEX idx_meal_type (meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='사용자 식단 기록';

CREATE TABLE diet_warnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  diet_log_id INT NOT NULL,
  medication_id INT NOT NULL,
  warning_message TEXT NOT NULL,
  severity ENUM('높음', '중간', '낮음') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (diet_log_id) REFERENCES diet_logs(id) ON DELETE CASCADE,
  FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_diet_log_id (diet_log_id),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='식단-약 충돌 경고';

-- ============================================
-- 알림 시스템
-- ============================================

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('medication_reminder', 'diet_warning', 'family_alert', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  `read` BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_read (`read`),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='웹 알림 (Phase 1)';

-- ============================================
-- 초기 데이터 (선택 사항)
-- ============================================

-- 테스트용 사용자 (개발 환경용)
-- INSERT INTO users (email, password_hash, name, phone, role) VALUES
-- ('senior@test.com', '$2a$10$...', '김시니어', '010-1234-5678', 'senior'),
-- ('caregiver@test.com', '$2a$10$...', '이자녀', '010-9876-5432', 'caregiver');

-- ============================================
-- 뷰 (View) - 복약 순응도 계산
-- ============================================

CREATE OR REPLACE VIEW medication_adherence AS
SELECT
  u.id AS user_id,
  u.name AS user_name,
  m.id AS medication_id,
  m.name AS medication_name,
  COUNT(ml.id) AS total_scheduled,
  SUM(CASE WHEN ml.completed = TRUE THEN 1 ELSE 0 END) AS completed_count,
  SUM(CASE WHEN ml.missed = TRUE THEN 1 ELSE 0 END) AS missed_count,
  ROUND(
    (SUM(CASE WHEN ml.completed = TRUE THEN 1 ELSE 0 END) * 100.0) / COUNT(ml.id),
    2
  ) AS adherence_rate
FROM users u
JOIN medications m ON u.id = m.user_id
LEFT JOIN medication_logs ml ON m.id = ml.medication_id
WHERE ml.scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, m.id;

-- ============================================
-- 스토어드 프로시저 (선택 사항)
-- ============================================

DELIMITER //

-- 약 복용 체크 프로시저
CREATE PROCEDURE check_medication(
  IN p_medication_id INT,
  IN p_user_id INT,
  IN p_scheduled_time TIMESTAMP
)
BEGIN
  INSERT INTO medication_logs (medication_id, user_id, scheduled_time, completed_time, completed)
  VALUES (p_medication_id, p_user_id, p_scheduled_time, NOW(), TRUE);

  -- 재고 감소
  UPDATE medications
  SET remaining = remaining - 1
  WHERE id = p_medication_id AND remaining > 0;
END //

-- 약-음식 충돌 체크 프로시저
CREATE PROCEDURE check_drug_food_conflict(
  IN p_user_id INT,
  IN p_food_name VARCHAR(255)
)
BEGIN
  SELECT
    dfi.id,
    dfi.drug_name,
    dfi.food_name,
    dfi.severity,
    dfi.reason,
    dfi.alternatives
  FROM drug_food_interactions dfi
  JOIN medications m ON dfi.drug_name = m.name OR dfi.drug_ingredient = m.ingredient
  WHERE m.user_id = p_user_id
    AND m.end_date >= CURDATE()
    AND dfi.food_name LIKE CONCAT('%', p_food_name, '%');
END //

DELIMITER ;

-- ============================================
-- 트리거 (자동 알림 생성)
-- ============================================

DELIMITER //

-- 약 재고 부족 알림
CREATE TRIGGER notify_low_medication_stock
AFTER UPDATE ON medications
FOR EACH ROW
BEGIN
  IF NEW.remaining <= 5 AND OLD.remaining > 5 THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'system',
      '약 재고 부족',
      CONCAT(NEW.name, ' 재고가 ', NEW.remaining, '개 남았습니다. 재구매가 필요합니다.')
    );
  END IF;
END //

-- 유효기간 임박 알림 (7일 전)
CREATE TRIGGER notify_expiry_warning
AFTER INSERT ON medications
FOR EACH ROW
BEGIN
  IF NEW.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'system',
      '약 유효기간 임박',
      CONCAT(NEW.name, '의 유효기간이 ', NEW.expiry_date, '입니다. 확인해주세요.')
    );
  END IF;
END //

DELIMITER ;

-- ============================================
-- 권한 설정 (선택 사항)
-- ============================================

-- 애플리케이션용 사용자 생성
-- CREATE USER 'silvercare_app'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON silvercare.* TO 'silvercare_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- 인덱스 최적화 힌트
-- ============================================

-- 복합 인덱스 추가 (성능 최적화)
-- ALTER TABLE medication_logs ADD INDEX idx_user_date (user_id, scheduled_time);
-- ALTER TABLE diet_logs ADD INDEX idx_user_date (user_id, recorded_at);
-- ALTER TABLE notifications ADD INDEX idx_user_unread (user_id, `read`, created_at);

-- ============================================
-- 파티셔닝 (대용량 데이터 처리용, 선택 사항)
-- ============================================

-- medication_logs 테이블 월별 파티셔닝 예시
-- ALTER TABLE medication_logs PARTITION BY RANGE (YEAR(scheduled_time) * 100 + MONTH(scheduled_time)) (
--   PARTITION p202511 VALUES LESS THAN (202512),
--   PARTITION p202512 VALUES LESS THAN (202601),
--   PARTITION p_max VALUES LESS THAN MAXVALUE
-- );
