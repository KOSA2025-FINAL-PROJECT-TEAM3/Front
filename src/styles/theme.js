/**
 * MUI Theme Configuration
 * - Material UI 테마 커스터마이징
 * - 프로토타입의 디자인 아이덴티티 적용 (Indigo, 둥근 모서리)
 */

import { createTheme } from '@mui/material/styles'

export const UI_FONT_SCALES = {
  default: 16,
  accessibility: 18,
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
    primary: '#111827',   // gray-900
    secondary: '#6b7280', // gray-500
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
    fontWeight: 700,
    lineHeight: 1.2,
    '@media (max-width:600px)': {
      fontSize: '2rem',   // 32px (Mobile)
    },
  },
  h2: {
    fontSize: '2rem',     // 32px
    fontWeight: 600,
    lineHeight: 1.3,
    '@media (max-width:600px)': {
      fontSize: '1.75rem', // 28px (Mobile)
    },
  },
  h3: {
    fontSize: '1.75rem', // 28px
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width:600px)': {
      fontSize: '1.5rem', // 24px (Mobile)
    },
  },
  h4: {
    fontSize: '1.5rem',  // 24px
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width:600px)': {
      fontSize: '1.25rem', // 20px (Mobile)
    },
  },
  h5: {
    fontSize: '1.25rem', // 20px
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.125rem', // 18px
    fontWeight: 500,
    lineHeight: 1.5,
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
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  button: {
    textTransform: 'none', // 버튼 텍스트 대문자 변환 비활성화
    fontWeight: 500,
  },
}

// Shape: 둥근 모서리 강조 (프로토타입 스타일)
const shape = {
  borderRadius: 12, // 기본 12px (rounded-xl 느낌)
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
const createComponents = ({ accessibilityMode }) => ({
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        fontSize: accessibilityMode
          ? `${UI_FONT_SCALES.accessibility}px`
          : `${UI_FONT_SCALES.default}px`,
      },
      body: {
        backgroundColor: palette.background.default,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
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
        borderRadius: 16, // rounded-2xl
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 12,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
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
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
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

export const createAppTheme = ({ accessibilityMode = false } = {}) =>
  createTheme({
    breakpoints,
    palette,
    typography,
    shape,
    spacing,
    shadows,
    components: createComponents({ accessibilityMode }),
  })

export default createAppTheme()
