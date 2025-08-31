// Design tokens shared across themes
export const tokens = {
  // Typography
  fonts: {
    ui: 'Inter, sans-serif',
    document: 'Roboto, sans-serif',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Colors - ATLAS Brand
  colors: {
    // ATLAS Navy (Horizon primary)
    navy: {
      primary: '#022D5E',
      dark: '#022650',
      link: '#034A9B',
    },
    // ATLAS Turquesa (Pulse primary)  
    turquesa: {
      primary: '#2EB0CB',
      dark: '#2798B0',
      subtle: '#6ECFE0',
    },
    // Neutros UI
    neutral: {
      ink: '#111827',
      textSecondary: '#6B7280',
      iconMuted: '#9CA3AF',
      border: '#E5E7EB',
      bgBase: '#F8FAFC',
      surface: '#FFFFFF',
    },
    // Semánticos
    semantic: {
      success: '#16A34A',
      warning: '#F59E0B',
      danger: '#DC2626',
      info: '#2563EB',
    },
    // Icon states
    icon: {
      inactive: '#6B7280',
      disabled: '#CBD5E1',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '3rem',   // 48px
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  // Breakpoints
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
  },
} as const;

export type Theme = typeof tokens;