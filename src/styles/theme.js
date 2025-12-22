/**
 * MUI Theme Configuration
 * - Material UI 테마 커스터마이징
 * - 프로토타입의 디자인 아이덴티티 적용 (Indigo, 둥근 모서리)
 */

import { createTheme } from '@mui/material/styles'

export const UI_FONT_SCALES = {
  level1: 16, // 표준(100%)
  level2: 18, // 크게(112.5%)
  level3: 20, // 더 크게(125%)
  default: 16,
  accessibility: 18,
}

const clampFontScaleLevel = (value) => {
  const normalized = Number(value)
  if (!Number.isFinite(normalized)) return null
  return Math.max(1, Math.min(3, Math.round(normalized)))
}

const resolveFontScaleLevel = ({ fontScaleLevel, accessibilityMode }) => {
  const normalized = clampFontScaleLevel(fontScaleLevel)
  if (normalized) return normalized
  return accessibilityMode ? 2 : 1
}

const fontSizePxByLevel = (level) => {
  if (level === 3) return UI_FONT_SCALES.level3
  if (level === 2) return UI_FONT_SCALES.level2
  return UI_FONT_SCALES.level1
}

// Breakpoints: Mobile -> Tablet -> Desktop
const breakpoints = {
  values: {
    xs: 0,      // Mobile
    sm: 600,    // Tablet
    md: 900,    // Desktop
    lg: 1200,   // Large Desktop
    xl: 1536,   // Extra Large Desktop
  },
}

// Palette: Teal primary (RN prototype) + Soft blue background
const palette = {
  primary: {
    main: '#2EC4B6',      // RN brand teal
    light: '#5AD6CA',     // lighter teal
    dark: '#25A094',      // darker teal
    contrastText: '#ffffff',
  },
  divider: '#E2E8F0',     // RN border/divider
  secondary: {
    main: '#f59e0b',      // amber-500
    light: '#fbbf24',     // amber-400
    dark: '#d97706',      // amber-600
    contrastText: '#ffffff',
  },
  background: {
    default: '#F6FAFF',   // RN-style soft blue
    paper: '#ffffff',
  },
  text: {
    primary: '#0F172A',   // slate-900 (RN prototype)
    secondary: '#475569', // slate-600
  },
  success: {
    main: '#10b981',      // green-500
    light: '#34d399',     // green-400
    dark: '#059669',      // green-600
  },
  error: {
    main: '#ef4444',      // red-500
    light: '#f87171',     // red-400
    dark: '#dc2626',      // red-600
  },
  warning: {
    main: '#f59e0b',      // amber-500
    light: '#fbbf24',     // amber-400
    dark: '#d97706',      // amber-600
  },
  info: {
    main: '#3b82f6',      // blue-500
    light: '#60a5fa',     // blue-400
    dark: '#2563eb',      // blue-600
  },
}

// Typography: 한글 가독성 최적화
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans KR"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '2.5rem',   // 40px
    fontWeight: 900,
    lineHeight: 1.2,
    letterSpacing: -0.8,
    '@media (max-width:600px)': {
      fontSize: '2rem',   // 32px (Mobile)
    },
  },
  h2: {
    fontSize: '2rem',     // 32px
    fontWeight: 900,
    lineHeight: 1.3,
    letterSpacing: -0.7,
    '@media (max-width:600px)': {
      fontSize: '1.75rem', // 28px (Mobile)
    },
  },
  h3: {
    fontSize: '1.75rem', // 28px
    fontWeight: 900,
    lineHeight: 1.4,
    letterSpacing: -0.6,
    '@media (max-width:600px)': {
      fontSize: '1.5rem', // 24px (Mobile)
    },
  },
  h4: {
    fontSize: '1.5rem',  // 24px
    fontWeight: 800,
    lineHeight: 1.4,
    letterSpacing: -0.5,
    '@media (max-width:600px)': {
      fontSize: '1.25rem', // 20px (Mobile)
    },
  },
  h5: {
    fontSize: '1.25rem', // 20px
    fontWeight: 800,
    lineHeight: 1.5,
    letterSpacing: -0.4,
  },
  h6: {
    fontSize: '1.125rem', // 18px
    fontWeight: 800,
    lineHeight: 1.5,
    letterSpacing: -0.3,
  },
  body1: {
    fontSize: '1rem',    // 16px
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 800,
    lineHeight: 1.5,
    letterSpacing: -0.2,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 800,
    lineHeight: 1.5,
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  button: {
    textTransform: 'none', // 버튼 텍스트 대문자 변환 비활성화
    fontWeight: 800,
  },
}

// Shape: 둥근 모서리 강조 (프로토타입 스타일)
const shape = {
  borderRadius: 8, // sx의 숫자 borderRadius(예: 3=24px)와 RN 감성(20~24px)을 맞추기 위한 베이스
}

// Spacing: 8px 기반 (MUI default)
const spacing = 8

// Shadows: 부드러운 그림자 효과
const shadows = [
  'none',
  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // shadow-sm
  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // shadow
  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // shadow-md
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // shadow-lg
  '0 25px 50px -12px rgb(0 0 0 / 0.25)', // shadow-xl
  '0 25px 50px -12px rgb(0 0 0 / 0.25)', // shadow-2xl
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
]

// Component Overrides: MUI 컴포넌트 기본 스타일 재정의
const createComponents = ({ fontScaleLevel, accessibilityMode }) => {
  const resolvedLevel = resolveFontScaleLevel({ fontScaleLevel, accessibilityMode })
  const fontSizePx = fontSizePxByLevel(resolvedLevel)

  return ({
  MuiCssBaseline: {
    styleOverrides: {
      ':root': {
        '--safe-area-top': 'env(safe-area-inset-top, 0px)',
        '--safe-area-right': 'env(safe-area-inset-right, 0px)',
        '--safe-area-bottom': 'env(safe-area-inset-bottom, 0px)',
        '--safe-area-left': 'env(safe-area-inset-left, 0px)',
        '--bottom-dock-height': '72px',
        '--bottom-dock-gap': '16px',
      },
      html: {
        fontSize: `${fontSizePx}px`,
      },
      body: {
        backgroundColor: palette.background.default,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        padding: '10px 20px',
        fontSize: '1rem',
        fontWeight: 500,
        minHeight: 44,
      },
      contained: {
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 24,
        border: `1px solid ${palette.divider}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 24,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 24,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 24,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        fontWeight: 800,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 20,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        minHeight: 44,
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        minHeight: 44,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 20,
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 44,
        minHeight: 44,
      },
    },
  },
  })
}

export const createAppTheme = ({ fontScaleLevel, accessibilityMode = false } = {}) => {
  const resolvedLevel = resolveFontScaleLevel({ fontScaleLevel, accessibilityMode })
  const htmlFontSize = fontSizePxByLevel(resolvedLevel)

  return createTheme({
    breakpoints,
    palette,
    typography: {
      ...typography,
      htmlFontSize,
    },
    shape,
    spacing,
    shadows,
    components: createComponents({ fontScaleLevel: resolvedLevel, accessibilityMode }),
  })
}

export default createAppTheme()
