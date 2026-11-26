// One MUI theme for consistent colours, typography, spacing and interaction states.
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5', light: '#818cf8', dark: '#3730a3' },
    secondary: { main: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' },
    success: { main: '#15803d' },
    warning: { main: '#b45309' },
    error: { main: '#b91c1c' },
    // Darker than MUI's default info blue so white chip text meets WCAG AA contrast (4.5:1)
    info: { main: '#0369a1' },
    background: { default: '#f4f6fb', paper: '#ffffff' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #5b21b6 100%)' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiAppBar: { styleOverrides: { root: { border: 'none', boxShadow: 'none' } } },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#334155',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiFormControl: { defaultProps: { size: 'small' } },
  },
})
