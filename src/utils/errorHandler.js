/**
 * 에러 코드에 따른 사용자 친화적 메시지 반환
 * @param {Error} error - Axios error object
 * @param {Function} navigate - React Router navigate function
 * @returns {string} - 사용자에게 표시할 에러 메시지
 */
import { ROUTE_PATHS } from '@config/routes.config';

export const handleInviteError = (error, navigate) => {
  const errorCode = error.response?.data?.errorCode;
  const message = error.response?.data?.message;
  
  switch (errorCode) {
    case 'ROLE_REQUIRED':
      if (navigate) {
        navigate(ROUTE_PATHS.roleSelection);
      }
      return '역할 선택이 필요합니다.';
      
    case 'IDENTITY_MISMATCH':
      return message || '초대받은 이메일로 로그인해주세요.';
      
    case 'INVITE_EXPIRED':
      return '만료되었거나 이미 사용된 초대입니다.';
      
    case 'ROLE_CONFLICT':
      return message || '이미 다른 역할로 활동 중입니다.';
      
    case 'ALREADY_MEMBER':
      if (navigate) {
        navigate(ROUTE_PATHS.family);
      }
      return '이미 해당 가족의 멤버입니다.';
      
    case 'RATE_LIMIT':
      return '잠시 후 다시 시도해주세요.';
      
    default:
      return message || '요청 처리에 실패했습니다.';
  }
};
