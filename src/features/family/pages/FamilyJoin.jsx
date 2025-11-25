import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { inviteService } from '../services/inviteService';
import './FamilyJoin.scss';

export default function FamilyJoin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL에서 token이 있으면 자동으로 startInvite 호출
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleStartInvite(token);
    }
  }, [searchParams]);

  const handleStartInvite = async (token) => {
    try {
      const result = await inviteService.startInvite(token);
      // 쿠키에 shortCode가 저장되므로 자동으로 입력
      setCode(result.shortCode || '');
    } catch (err) {
      setError('유효하지 않은 초대 링크입니다.');
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('6자리 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await inviteService.acceptInvite(code);
      alert('가족 그룹에 참여했습니다!');
      navigate('/family');
    } catch (err) {
      const errorCode = err.response?.data?.errorCode;
      const message = err.response?.data?.message;
      
      switch (errorCode) {
        case 'ROLE_REQUIRED':
          navigate('/select-role');
          break;
        case 'IDENTITY_MISMATCH':
          setError(message || '초대받은 이메일로 로그인해주세요.');
          break;
        case 'INVITE_EXPIRED':
          setError('만료되었거나 이미 사용된 초대입니다.');
          break;
        case 'ROLE_CONFLICT':
          setError(message || '이미 다른 역할로 활동 중입니다.');
          break;
        case 'ALREADY_MEMBER':
          setError('이미 해당 가족의 멤버입니다.');
          navigate('/family');
          break;
        case 'RATE_LIMIT':
          setError('잠시 후 다시 시도해주세요.');
          break;
        default:
          setError('초대 수락에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="family-join-page">
      <div className="family-join-container">
        <h1>가족 그룹 참여</h1>
        <p className="description">
          초대 코드를 입력하여 가족 그룹에 참여하세요
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="code-input-group">
            <label>초대 코드 (6자리)</label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="A3K7M2"
              className="code-input"
              maxLength={6}
              autoFocus
            />
            <small className="hint">
              이메일로 받은 6자리 코드를 입력하세요
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || code.length !== 6}
          >
            {loading ? '처리 중...' : '참여하기'}
          </button>
        </form>

        <div className="signup-link">
          <p>아직 회원이 아니신가요?</p>
          <a href="/signup">회원가입</a>
        </div>
      </div>
    </div>
  );
}
