import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/tailwind.css'
import './styles/base.scss'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 0,
    },
  },
})

// Auto-remove DEV_MODE when VITE_USE_MOCK_API=false
if (import.meta.env.VITE_USE_MOCK_API !== 'true') {
  localStorage.removeItem('amapill_dev_mode')
  console.log('✅ DEV_MODE 자동 비활성화 (실제 API 모드)')
}

createRoot(rootElement).render(
  
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  
)
