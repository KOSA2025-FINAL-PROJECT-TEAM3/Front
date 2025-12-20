import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl' // SSL Disabled - Using Tunneling instead
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production'
  const isBuild = command === 'build'

  return {
    plugins: [react()],
    // Use '/Front/' for production (GitHub Pages), '/' for development
    base: isProd ? '/Front/' : '/',
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
          target: 'http://localhost:80',  // Nginx → Gateway로 연결
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:80',    // WebSocket via Nginx
          ws: true,
        }
      }
    },
    // Production 빌드에서만 console/debugger 제거
    esbuild: isBuild && isProd ? { drop: ['console', 'debugger'] } : {},
    build: {
      target: 'ES2020',
      outDir: 'dist',
      sourcemap: false,
      // Chunk splitting for better caching and parallel loading
      rollupOptions: {
        output: {
          manualChunks: {
            // React core - rarely changes
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // MUI components - large bundle, separate for caching
            'vendor-mui': [
              '@mui/material',
              '@mui/icons-material',
              '@emotion/react',
              '@emotion/styled'
            ],
            // Data fetching and state management
            'vendor-data': ['@tanstack/react-query', 'zustand', 'axios'],
            // Date utilities
            'vendor-date': ['date-fns'],
          }
        }
      },
      // Increase chunk size warning limit (optional)
      chunkSizeWarningLimit: 500,
    }
  }
})
