import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 경로 alias 설정으로 import 경로를 간단하게
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@components': path.resolve(rootDir, './src/components'),
      '@hooks': path.resolve(rootDir, './src/hooks'),
      '@utils': path.resolve(rootDir, './src/utils'),
      '@stores': path.resolve(rootDir, './src/stores'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@styles': path.resolve(rootDir, './src/styles'),
      '@config': path.resolve(rootDir, './src/config'),
    },
  },
  server: {
    host: true,         // ✅ 외부 접근 허용 (0.0.0.0으로 바인딩)
    port: 5173,         // 기본 포트
    open: false,        // 자동 브라우저 열기 끄기
    cors: true,         // CORS 허용
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: false,
  }
})
