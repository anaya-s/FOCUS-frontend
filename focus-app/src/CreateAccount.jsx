import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

import { useNavigate } from "react-router-dom";


function CreateAccount() {
const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Account Creation Successful!');
    console.log('Name: ', name)
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

  const navigate = useNavigate();

  const toLogin = () => {
    navigate("/");
  };

  return (
    <Box style={pageStyle}>
      <Container maxWidth="xs">
        <Typography variant="h4" component="h1" gutterBottom>
          Experience the future of productivity
        </Typography>
        <Typography variant="h6" component="h1">
          Create your new account
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
              <img src="./images/google_logo.svg" style={{marginRight: 10}}/>Sign up with Google
            </Button>
            <Divider>
            OR</Divider>
            <Typography textAlign={'left'} marginLeft={0.5}>Name</Typography>
            <TextField
              // label="Name"
              type="name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin='dense'
              required
            />
            <Typography textAlign={'left'} marginLeft={0.5}  marginTop={1}>Email</Typography>
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
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ marginTop: 2, marginBottom: 2, backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
            >
              Sign up
            </Button>
            <Typography>By signing up, you agree to our{' '}
                <Link>T&Cs</Link>
            </Typography>
          </form>
        </Box>
        <Typography sx={{ marginTop: 2}} fontSize="18px">
            Already have an account?{' '}
            <Link onClick={toLogin} style={{ cursor: 'pointer' }}>Log in</Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default CreateAccount;