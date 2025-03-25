import { Box, Typography, Grid2, Link, Divider } from '@mui/material';
import { useState } from 'react';
import {
  Web as WebIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

const Footer = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const checkIfLoggedIn = () => {
    if(localStorage.getItem("authTokens"))
      return true;
    else
      return false;
  };

  return (
    <Box sx={{backgroundColor: '#f5f5f2'}}>
      <Box 
        sx={{  
          p: 4, 
          mt: 'auto',
          marginTop: 10,
          position: 'relative',
          zIndex: 1300,
          
          
        }}
        component="footer"
      >
        <Grid2 container columnSpacing={20} rowSpacing={5}>
          <Grid2 item xs={5}>
            <Typography variant="h6" sx={{fontWeight: "bold", pl: "10px", pr: "10px", fontSize: "25px", color: 'primary'}}>FOCUS</Typography>
          </Grid2>
          
          <Grid2 item xs={5}>
            <Typography variant="h5">Quick Links</Typography>
            <Divider sx={{mb: "10px"}}/>
            <Link href="/" variant="body2" color="inherit" underline="hover">Homepage</Link><br />
            <Link href="/about" variant="body2" color="inherit" underline="hover">About Us</Link><br />
            <Link href="/products" variant="body2" color="inherit" underline="hover">Our Products</Link><br />
            <Divider sx={{mb: "10px", visibility: "hidden"}}/>
            {!checkIfLoggedIn() ? (
            <div>
              <Link href="/login" variant="body2" color="inherit" underline="hover">Login</Link><br />
              <Link href="/register" variant="body2" color="inherit" underline="hover">Register</Link><br />
            </div>
            ) : null
            } 
          </Grid2>

          <Grid2 item xs={5}>
            <Typography variant="h5" sx={{visibility: "hidden"}}>Quick Links</Typography>
            <Divider sx={{mb: "10px", visibility: "hidden"}}/>
            <Link href="/drive" variant="body2" color="inherit" underline="hover">Drive</Link><br />
            <Link href="/account/dashboard" variant="body2" color="inherit" underline="hover">Dashboard</Link><br />
            <Divider sx={{mb: "10px", visibility: "hidden"}}/>
            <Link href="/account/profile" variant="body2" color="inherit" underline="hover">Profile</Link><br />
            <Link href="/account/settings" variant="body2" color="inherit" underline="hover">Settings</Link><br />
          </Grid2>

          <Grid2 item xs={5}>
            <Typography variant="h5">GitHub Repos</Typography>
            <Divider sx={{mb: "10px"}}/>
            <Link href="https://github.com/anaya-s/FOCUS-frontend" target="_blank" rel="noopener noreferrer" variant="body2" color="inherit" underline="hover" style={{ display: 'flex', alignItems: 'center' }} onMouseEnter={() => setHoveredLink('front-end')} onMouseLeave={() => setHoveredLink(null)}><span style={{marginTop: 5, marginRight: 10}}>Front-end</span>{hoveredLink === 'front-end' ? <GitHubIcon /> : <WebIcon />}</Link><br />
            <Link href="https://github.com/LewisArnold1/FOCUS-Backend" target="_blank" rel="noopener noreferrer" variant="body2" color="inherit" underline="hover" style={{ display: 'flex', alignItems: 'center' }} onMouseEnter={() => setHoveredLink('back-end')} onMouseLeave={() => setHoveredLink(null)}><span style={{marginTop: 5, marginRight: 10}}>Back-end</span>{hoveredLink === 'back-end' ? <GitHubIcon /> : <StorageIcon />}</Link><br />
            <Link href="https://github.com/Mahiethan/WebGazer-FOCUS" target="_blank" rel="noopener noreferrer" variant="body2" color="inherit" underline="hover" style={{ display: 'flex', alignItems: 'center' }} onMouseEnter={() => setHoveredLink('webgazer')} onMouseLeave={() => setHoveredLink(null)}><span style={{marginTop: 5, marginRight: 10}}>Webgazer</span>{hoveredLink === 'webgazer' ? <GitHubIcon /> : <VisibilityIcon />}</Link><br />
          </Grid2>
        </Grid2>

        <Divider sx={{mt: "15px"}}/>

        <Box sx={{mt: "2vh", mb: "-5vh", display: "flex", flexDirection: "row", width: "100vw"}}>
          <Typography variant="body2" color="text.secondary" sx={{width: "100%"}}>
            © 2024-2025 ES410 Group 18. Licensed under the <a href="https://github.com/anaya-s/FOCUS-frontend/blob/main/LICENSE.txt" target="_blank">MIT License</a>
          </Typography>
          <Link href="/terms-and-conditions" variant="body2" color="inherit" underline="hover" sx={{ml: "40vh", visibility: "hidden"}}>Terms & Conditions</Link>
          <Link href="/privacy-policy" variant="body2" color="inherit" underline="hover" sx={{ml: "10vh", visibility: "hidden"}}>Privacy Policy</Link>
        </Box>

      </Box>
    </Box>
  );
}

export default Footer;
