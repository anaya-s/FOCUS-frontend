import { createTheme } from '@mui/material/styles';
import '@fontsource/jua';
import '@fontsource/inter';

const theme = createTheme({
  typography: {
    fontFamily: '"Istok Web", sans-serif',
    h1: {
      fontSize: 17, 
    },
    h2: {
      fontFamily: '"Istok Web", sans-serif',
      fontSize: 75,
    },
    h3: {
      fontFamily: '"Istok Web", sans-serif',
      color: '#06760D',
      fontSize:75,
    },
    h5: {
      fontFamily: '"Istok Web", sans-serif',
      color: '#06760D',
      fontSize: 17,
    },
    h6: {
      fontFamily: '"Istok Web", sans-serif',
      color: '000000',
      fontSize: 17,
    },
    h7: {
      fontFamily: '"Istok Web", sans-serif',
      fontSize: 17,
    },
    body1: {
      fontSize: '16',
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