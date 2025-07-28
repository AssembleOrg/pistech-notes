import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getThemeTokens } from '../theme/designTokens';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return (savedMode as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const tokens = getThemeTokens(mode);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.colors.primary[500],
        light: tokens.colors.primary[100],
        dark: tokens.colors.primary[700],
        contrastText: mode === 'light' ? '#ffffff' : '#000000',
      },
      secondary: {
        main: tokens.colors.secondary[500],
        light: tokens.colors.secondary[100],
        dark: tokens.colors.secondary[600],
        contrastText: mode === 'light' ? '#ffffff' : '#000000',
      },
      background: {
        default: tokens.colors.background.primary,
        paper: tokens.colors.surface.primary,
      },
      text: {
        primary: mode === 'light' ? tokens.colors.neutral[800] : tokens.colors.neutral[100],
        secondary: mode === 'light' ? tokens.colors.neutral[600] : tokens.colors.neutral[300],
      },
      success: {
        main: tokens.colors.success[500],
        light: tokens.colors.success[50],
        dark: tokens.colors.success[700],
      },
      warning: {
        main: tokens.colors.warning[500],
        light: tokens.colors.warning[50],
        dark: tokens.colors.warning[700],
      },
      error: {
        main: tokens.colors.error[500],
        light: tokens.colors.error[50],
        dark: tokens.colors.error[700],
      },
      info: {
        main: tokens.colors.info[500],
        light: tokens.colors.info[50],
        dark: tokens.colors.info[700],
      },
    },
    typography: {
      fontFamily: tokens.typography.fontFamily.primary,
      h1: {
        fontSize: tokens.typography.fontSize['4xl'],
        fontWeight: tokens.typography.fontWeight.bold,
        lineHeight: tokens.typography.lineHeight.tight,
      },
      h2: {
        fontSize: tokens.typography.fontSize['3xl'],
        fontWeight: tokens.typography.fontWeight.bold,
        lineHeight: tokens.typography.lineHeight.tight,
      },
      h3: {
        fontSize: tokens.typography.fontSize['2xl'],
        fontWeight: tokens.typography.fontWeight.bold,
        lineHeight: tokens.typography.lineHeight.tight,
      },
      h4: {
        fontSize: tokens.typography.fontSize.xl,
        fontWeight: tokens.typography.fontWeight.bold,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      h5: {
        fontSize: tokens.typography.fontSize.lg,
        fontWeight: tokens.typography.fontWeight.medium,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      h6: {
        fontSize: tokens.typography.fontSize.md,
        fontWeight: tokens.typography.fontWeight.medium,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      body1: {
        fontSize: tokens.typography.fontSize.md,
        fontWeight: tokens.typography.fontWeight.regular,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      body2: {
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.regular,
        lineHeight: tokens.typography.lineHeight.relaxed,
      },
      caption: {
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        lineHeight: tokens.typography.lineHeight.normal,
      },
    },
    shape: {
      borderRadius: parseInt(tokens.borderRadius.md),
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.sm,
            transition: tokens.transitions.normal,
            '&:hover': {
              boxShadow: tokens.shadows.md,
              transform: 'scale(1.02)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.md,
            fontWeight: tokens.typography.fontWeight.medium,
            textTransform: 'none',
            transition: tokens.transitions.normal,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: tokens.shadows.sm,
            },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: tokens.shadows.sm,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: tokens.borderRadius.md,
              transition: tokens.transitions.normal,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.primary[300],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.primary[500],
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: tokens.typography.fontWeight.medium,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: tokens.borderRadius.xl,
            boxShadow: tokens.shadows.lg,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.md,
            fontWeight: tokens.typography.fontWeight.medium,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: tokens.shadows.sm,
            borderBottom: `1px solid ${mode === 'light' ? tokens.colors.neutral[200] : tokens.colors.neutral[700]}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${mode === 'light' ? tokens.colors.neutral[200] : tokens.colors.neutral[700]}`,
            boxShadow: tokens.shadows.sm,
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 