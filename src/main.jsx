import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/tailwind.css'
import './styles/base.scss'
import App from './App'
import logger from '@core/utils/logger'
import { injectStore } from '@core/interceptors/authInterceptor'
import { useAuthStore } from '@features/auth/store/authStore'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Auth Store를 Axios Interceptor에 주입 (순환 참조 방지)
injectStore(useAuthStore)

// Auto-remove DEV_MODE when VITE_USE_MOCK_API=false
if (import.meta.env.VITE_USE_MOCK_API !== 'true') {
  localStorage.removeItem('amapill_dev_mode')
  logger.info('✅ DEV_MODE 자동 비활성화 (실제 API 모드)')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 0,
    },
  },
})

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)

