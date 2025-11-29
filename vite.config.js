import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Front/',  // GitHub Pages 배포를 위한 base 경로
  resolve: {
    // 경로 alias 설정으로 import 경로를 간단하게
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@features': path.resolve(rootDir, './src/features'),
      '@shared': path.resolve(rootDir, './src/shared'),
      '@components': path.resolve(rootDir, './src/shared/components'),
      '@devtools': path.resolve(rootDir, './src/devtools'),
      '@hooks': path.resolve(rootDir, './src/hooks'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@styles': path.resolve(rootDir, './src/styles'),
      '@utils': path.resolve(rootDir, './src/core/utils'),
      '@config': path.resolve(rootDir, './src/core/config'),
      '@core': path.resolve(rootDir, './src/core'),
    },
  },
  server: {
    host: true,         // ✅ 외부 접근 허용 (0.0.0.0으로 바인딩)
    port: 5173,         // 기본 포트
    open: false,        // 자동 브라우저 열기 끄기
    cors: true,         // CORS 허용
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Gateway로 직접 연결
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',    // WebSocket
        ws: true,
      }
    }
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: false,
  }
})
