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
      fontweight: 1000,
    },
    h3: {
      fontFamily: '"Istok Web", sans-serif',
      color: '#06760D',
      fontweight: 500,
    },
    h5: {
      fontFamily: '"Istok Web", sans-serif',
      color: '#06760D',
      fontweight: 10000,
    },
    h6: {
      fontFamily: '"Istok Web", sans-serif',
      color: '000000',
      fontweight: 500,
    },
    h7: {
      fontFamily: '"Istok Web", sans-serif',
      fontweight: 1700,
    },
    body1: {
      fontSize: '1rem',
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
