import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true,       // ✅ 외부 접근 허용
    open: false,      // 자동 브라우저 열기 끄기 (선택)
  },
})
