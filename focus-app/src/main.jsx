import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Login from './Login.jsx' // Login page

import { ThemeProvider } from '@mui/material/styles';

import theme from './assets/theme.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
        {/* <App /> */}
        <Login />
    </ThemeProvider>
  </StrictMode>,
)
