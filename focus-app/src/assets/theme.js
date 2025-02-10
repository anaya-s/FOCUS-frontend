import { createTheme } from '@mui/material/styles';
import '@fontsource/jua';
import '@fontsource/inter';

const theme = createTheme({
  typography: {
    fontFamily: '"Istok Web", sans-serif',
    h1: {
      fontWeight: 700, 
    },
    h2: {
      fontFamily: '"Istok Web", sans-serif',
      fontWeight: 1000,
    },
    h3: {
      fontFamily: '"Istok Web", sans-serif',
      color: '#06760D',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Istok Web", sans-serif',
      color: '#06760D',
      fontWeight: 10000,
    },
    h6: {
      fontFamily: '"Istok Web", sans-serif',
      color: '000000',
      fontWeight: 500,
    },
    h7: {
      fontFamily: '"Istok Web", sans-serif',
      fontWeight: 1700,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        wrapper: {
          fontFamily: '"Istok Web", sans-serif',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#06760D', 
    },
    secondary: {
      main: '#dc004e', 
    },
  },
});

export default theme;