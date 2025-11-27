/**
 * Icon Component
 * - Inline SVG icons with currentColor stroke
 */

const baseStroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const ICON_PATHS = {
  home: (
    <>
      <path {...baseStroke} d="M3.5 11.5 12 4l8.5 7.5" />
      <path {...baseStroke} d="M6 10.5v8.5h5v-5h4v5h5v-9" />
    </>
  ),
  pill: (
    <>
      <rect
        {...baseStroke}
        x="3.5"
        y="8"
        width="17"
        height="8"
        rx="4"
        ry="4"
      />
      <path {...baseStroke} d="M12 8v8" />
    </>
  ),
  search: (
    <>
      <circle {...baseStroke} cx="11" cy="11" r="5.5" />
      <path {...baseStroke} d="M15.2 15.2 20 20" />
    </>
  ),
  family: (
    <>
      <circle {...baseStroke} cx="8" cy="9" r="2.7" />
      <circle {...baseStroke} cx="16" cy="9" r="2.7" />
      <path
        {...baseStroke}
        d="M3.5 18v-1c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4v1"
      />
      <path
        {...baseStroke}
        d="M11.5 18v-1c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4v1"
      />
    </>
  ),
  disease: (
    <>
      <circle {...baseStroke} cx="12" cy="12" r="7.5" />
      <path {...baseStroke} d="M12 8.5v7" />
      <path {...baseStroke} d="M8.5 12h7" />
    </>
  ),
  diet: (
    <>
      <path {...baseStroke} d="M12 4 20 18H4z" />
      <path {...baseStroke} d="M12 9.5v4" />
      <circle cx="12" cy="15.7" r="1" fill="currentColor" />
    </>
  ),
  ocr: (
    <>
      <rect
        {...baseStroke}
        x="4"
        y="7"
        width="16"
        height="10"
        rx="2"
        ry="2"
      />
      <circle {...baseStroke} cx="12" cy="12" r="3" />
      <path {...baseStroke} d="M7 4h2" />
      <path {...baseStroke} d="M15 4h2" />
    </>
  ),
  counsel: (
    <>
      <path
        {...baseStroke}
        d="M6 8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H9l-3 3v-3"
      />
      <path {...baseStroke} d="M9.5 9.5h6" />
      <path {...baseStroke} d="M9.5 12.5h4" />
    </>
  ),
  settings: (
    <>
      <circle {...baseStroke} cx="12" cy="12" r="3" />
      <path {...baseStroke} d="M12 5.5V4" />
      <path {...baseStroke} d="M12 20v-1.5" />
      <path {...baseStroke} d="M18.5 12H20" />
      <path {...baseStroke} d="M4 12h1.5" />
      <path {...baseStroke} d="m16.95 7.05 1.06-1.06" />
      <path {...baseStroke} d="m5.99 18.01 1.06-1.06" />
      <path {...baseStroke} d="m7.05 7.05-1.06-1.06" />
      <path {...baseStroke} d="m18.01 18.01-1.06-1.06" />
    </>
  ),
  logout: (
    <>
      <path
        {...baseStroke}
        d="M15 7V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"
      />
      <path {...baseStroke} d="M10 12h11" />
      <path {...baseStroke} d="m18 9 3 3-3 3" />
    </>
  ),
  list: (
    <>
      <path {...baseStroke} d="M8 6h10" />
      <path {...baseStroke} d="M6 6h.01" />
      <path {...baseStroke} d="M8 12h10" />
      <path {...baseStroke} d="M6 12h.01" />
      <path {...baseStroke} d="M8 18h10" />
      <path {...baseStroke} d="M6 18h.01" />
    </>
  ),
  plus: (
    <>
      <path {...baseStroke} d="M12 5v14" />
      <path {...baseStroke} d="M5 12h14" />
    </>
  ),
  download: (
    <>
      <path {...baseStroke} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline {...baseStroke} points="7 10 12 15 17 10" />
      <line {...baseStroke} x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
    ticket: (
      <>
        <path {...baseStroke} d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path {...baseStroke} d="M13 5v2" />
        <path {...baseStroke} d="M13 17v2" />
        <path {...baseStroke} d="M13 11v2" />
      </>
    ),
    default: (    <circle {...baseStroke} cx="12" cy="12" r="8" />
  ),
}

export const Icon = ({ name, size = 22, className, ...props }) => {
  const content = ICON_PATHS[name] || ICON_PATHS.default
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {content}
    </svg>
  )
}

export default Icon
