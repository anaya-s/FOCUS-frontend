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
      fontFamily: '"Jua", sans-serif',
      color: '#06760D',
      fontweight: 5000,
    },
    h5: {
      fontFamily: '"Jua", sans-serif',
      color: '#06760D',
      fontweight: 1500,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontweight: 500,
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
