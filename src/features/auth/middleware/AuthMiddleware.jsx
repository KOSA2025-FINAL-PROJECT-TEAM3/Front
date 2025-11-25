import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function AuthMiddleware({ children }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // 로그인한 사용자가 customerRole이 없으면 역할 선택 페이지로 리다이렉트
    if (user && !user.customerRole) {
      navigate('/select-role');
    }
  }, [user, navigate]);

  return children;
}
