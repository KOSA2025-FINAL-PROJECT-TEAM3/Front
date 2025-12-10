import logger from "@core/utils/logger"
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoleSelectionPage.scss';

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedRole) {
      alert('역할을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/select-role', { role: selectedRole });
      navigate('/dashboard');
    } catch (error) {
      logger.error('역할 선택 실패:', error);
      alert('역할 선택에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-container">
        <h1>역할 선택</h1>
        <p className="description">
          AMApill 서비스를 이용하기 위해 역할을 선택해주세요.
        </p>

        <div className="role-options">
          <div 
            className={`role-card ${selectedRole === 'SENIOR' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('SENIOR')}
          >
            <div className="role-icon">👴</div>
            <h3>어르신</h3>
            <p>약 복용 알림을 받고 건강을 관리합니다.</p>
          </div>

          <div 
            className={`role-card ${selectedRole === 'CAREGIVER' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('CAREGIVER')}
          >
            <div className="role-icon">👨‍⚕️</div>
            <h3>보호자</h3>
            <p>어르신의 약 복용을 관리하고 모니터링합니다.</p>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!selectedRole || loading}
          className="submit-button"
        >
          {loading ? '처리 중...' : '선택 완료'}
        </button>
      </div>
    </div>
  );
}
