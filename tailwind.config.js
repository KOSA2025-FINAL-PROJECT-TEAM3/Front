import { fileURLToPath } from 'url'
import path from 'path'

const srcPath = path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src')

export default {
  content: [
    './index.html',
    path.join(srcPath, '/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        guardian: '#a5b4fc',
        senior: '#f9a8d4',
        warning: '#f97316',
        danger: '#ef4444',
        success: '#22c55e',
        ocrBg: '#0f172a',
        ocrAccent: '#22d3ee',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
    },
  },
  plugins: [],
}
