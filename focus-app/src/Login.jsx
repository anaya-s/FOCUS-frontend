// src/Login.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Successful!');
    console.log('Email:', email);
    console.log('Password:', password);
  };

  const pageStyle = {
        display: 'flex',
        height: '100vh', 
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
  }

  return (
    <Box style={pageStyle}>
      <Container maxWidth="xs">
        <Typography variant="h3" component="h1" gutterBottom>
            Welcome back👋
        </Typography>
        <Typography variant="h6" component="h1">
          Enter your login details
        </Typography>
        <Box
          sx={{
            marginTop: 3,
            padding: 3,
            border: '1px solid #ccc',
            borderRadius: 2,
            textAlign: 'center',
            alignItems: 'center'
          }}
        >
          <form onSubmit={handleSubmit}>
            <Button
              //onClick={} // Link with Google OAuth
              fullWidth
              variant="contained"
              color="black"
              sx={{marginBottom: 2, backgroundColor: 'white', '&:hover': { backgroundColor: 'lightgray' }}}
            >
              <img src="./images/google_logo.svg" style={{marginRight: 10}}/>Sign in with Google
            </Button>
            <Divider>
            OR</Divider>
            <Typography textAlign={'left'} marginLeft={0.5}>Email</Typography>
            <TextField
              // label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin='dense'
              required
            />
            <Typography textAlign={'left'} marginLeft={0.5} marginTop={1}>Password</Typography>
            <TextField
              // label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin='dense'
              required
            />
            <Button
              size="small"
              sx={{marginBottom: 2}}
            >
            Forgotten password?
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ marginTop: 2, backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
            >
              Sign in
            </Button>
          </form>
        </Box>
        <Button
              size="small"
              sx={{ marginTop: 2}}
            >
            Create an account
            </Button>
      </Container>
    </Box>
  );
}

export default Login;