// Design Tokens for Pistech Notes
// Light and Dark mode color palettes, spacing, typography, and shadows

export const designTokens = {
  // Color Palettes
  colors: {
    light: {
      // Primaries
      primary: {
        50: '#e3f2fd',
        100: '#bbdefb',
        300: '#64b5f6',
        500: '#1976d2',
        600: '#1565c0',
        700: '#0d47a1',
      },
      // Secondaries
      secondary: {
        50: '#fce4ec',
        100: '#f8bbd9',
        500: '#dc004e',
        600: '#c2185b',
      },
      // Neutrals
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
      // States
      success: {
        50: '#e8f5e8',
        500: '#4caf50',
        700: '#388e3c',
      },
      warning: {
        50: '#fff3e0',
        500: '#ff9800',
        700: '#f57c00',
      },
      error: {
        50: '#ffebee',
        500: '#f44336',
        700: '#d32f2f',
      },
      info: {
        50: '#e3f2fd',
        500: '#2196f3',
        700: '#1976d2',
      },
      // Backgrounds
      background: {
        primary: '#ffffff',
        secondary: '#fafafa',
        tertiary: '#f5f5f5',
      },
      // Surfaces
      surface: {
        primary: '#ffffff',
        secondary: '#fafafa',
        elevated: '#ffffff',
      },
    },
    dark: {
      // Primaries (adjusted for dark)
      primary: {
        50: '#0d47a1',
        100: '#1565c0',
        300: '#90caf9',
        500: '#42a5f5',
        600: '#64b5f6',
        700: '#90caf9',
      },
      // Secondaries (adjusted for dark)
      secondary: {
        50: '#c2185b',
        100: '#e91e63',
        500: '#f48fb1',
        600: '#f8bbd9',
      },
      // Neutrals (inverted)
      neutral: {
        50: '#212121',
        100: '#424242',
        200: '#616161',
        300: '#757575',
        400: '#9e9e9e',
        500: '#bdbdbd',
        600: '#e0e0e0',
        700: '#eeeeee',
        800: '#f5f5f5',
        900: '#fafafa',
      },
      // States (adjusted for dark)
      success: {
        50: '#1b5e20',
        500: '#66bb6a',
        700: '#81c784',
      },
      warning: {
        50: '#e65100',
        500: '#ffb74d',
        700: '#ffcc02',
      },
      error: {
        50: '#b71c1c',
        500: '#ef5350',
        700: '#e57373',
      },
      info: {
        50: '#0d47a1',
        500: '#42a5f5',
        700: '#64b5f6',
      },
      // Backgrounds
      background: {
        primary: '#121212',
        secondary: '#1e1e1e',
        tertiary: '#2d2d2d',
      },
      // Surfaces
      surface: {
        primary: '#1e1e1e',
        secondary: '#2d2d2d',
        elevated: '#2d2d2d',
      },
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'Roboto Mono', 'Courier New', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '48px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Shadows
  shadows: {
    light: {
      xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
      sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
      md: '0 4px 8px rgba(0, 0, 0, 0.12)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.2)',
    },
    dark: {
      xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
      sm: '0 2px 4px rgba(0, 0, 0, 0.4)',
      md: '0 4px 8px rgba(0, 0, 0, 0.5)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.6)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.7)',
    },
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // Transitions
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
  },
};

export const getThemeTokens = (mode: 'light' | 'dark') => {
  const colors = designTokens.colors[mode];
  const shadows = designTokens.shadows[mode];
  
  return {
    colors,
    shadows,
    spacing: designTokens.spacing,
    typography: designTokens.typography,
    borderRadius: designTokens.borderRadius,
    transitions: designTokens.transitions,
  };
}; 