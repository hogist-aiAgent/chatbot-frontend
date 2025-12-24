import { createTheme } from '@mui/material/styles';

const primaryMain = '#9c4a4a'; // Hogist Red
const secondaryMain = '#FF8E8E';

export const theme = createTheme({
  palette: {
    primary: { main: primaryMain },
    secondary: { main: secondaryMain },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#6e6e6e' },
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    button: { fontWeight: 600, textTransform: 'none', borderRadius: 12 },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(at 0% 0%, hsla(358,66%,93%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(215,66%,96%,1) 0, transparent 50%), 
            radial-gradient(at 100% 100%, hsla(358,66%,96%,1) 0, transparent 50%)
          `,
          backgroundAttachment: 'fixed',
          height: '100vh',
        },
        /* Custom Scrollbar for Chrome/Safari */
        '::-webkit-scrollbar': { width: '6px' },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': { background: '#d1d1d1', borderRadius: '10px' },
        '::-webkit-scrollbar-thumb:hover': { background: primaryMain },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px 0 rgba(156, 74, 74, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: '0 10px 20px -5px rgba(156, 74, 74, 0.4)',
        },
      },
    },
  },
});