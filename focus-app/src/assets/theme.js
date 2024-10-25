import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Istok Web", sans-serif',
    h1: {
      fontWeight: 700, 
    },
    body1: {
      fontSize: '1rem',
    },

  },
  components: {
    MuiDivider: { /* For text inbetween MUI Divider lines */
      styleOverrides: {
        wrapper: {
          fontFamily: '"Istok Web", sans-serif',
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