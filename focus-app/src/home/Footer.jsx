import { Box, Typography, Grid2, Link, Divider } from '@mui/material';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  return (
    <Box>
      <Box 
        sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 4, 
          mt: 'auto',
          marginTop: 10,
          position: 'relative',
          zIndex: 1300,
          height: "35vh"
          
        }}
        component="footer"
      >
        <Grid2 container spacing={40}>
          <Grid2 item xs={12} sm={4}>
            <Typography variant="h6" sx={{fontWeight: "bold", pl: "10px", pr: "10px", fontSize: "25px", color: 'primary'}}>FOCUS</Typography>
          </Grid2>
          
          <Grid2 item xs={12} sm={4}>
            <Typography variant="h5">Quick Links</Typography>
            <Divider sx={{mb: "10px"}}/>
            <Link href="/" variant="body2" color="inherit" underline="hover">Homepage</Link><br />
            <Link href="/about" variant="body2" color="inherit" underline="hover">About Us</Link><br />
            <Link href="/products" variant="body2" color="inherit" underline="hover">Our Products</Link><br />
            <Link href="/login" variant="body2" color="inherit" underline="hover">Login</Link><br />
            <Link href="/register" variant="body2" color="inherit" underline="hover">Register</Link><br />
            <Link href="/account/dashboard" variant="body2" color="inherit" underline="hover">Dashboard</Link><br />
            <Link href="/account/profile" variant="body2" color="inherit" underline="hover">Profile</Link><br />
            <Link href="/account/settings" variant="body2" color="inherit" underline="hover">Settings</Link><br />
            <Link href="/calibrate" variant="body2" color="inherit" underline="hover">Calibration</Link><br />
            <Link href="/reading" variant="body2" color="inherit" underline="hover">Reading</Link><br />
          </Grid2>

          <Grid2 item xs={12} sm={4}>
            <Typography variant="h5">Follow Us</Typography>
            <Divider sx={{mb: "10px"}}/>
            <Link href="https://github.com/anaya-s/FOCUS-frontend" target="_blank" rel="noopener noreferrer" variant="body2" color="inherit" underline="hover"><GitHubIcon/></Link><br />
            <Link href="https://en-gb.facebook.com/login.php/" target="_blank" rel="noopener noreferrer" variant="body2" color="inherit" underline="hover"><FacebookRoundedIcon/></Link><br />
            <Link href="https://x.com/i/flow/login?lang=en" target="_blank" rel="noopener noreferrer" variant="body2" color="inherit" underline="hover"><XIcon/></Link><br />
            <Link href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" variant="body2" color="inherit" underline="hover"><InstagramIcon/></Link>
          </Grid2>
        </Grid2>

        <Divider sx={{mt: "15px"}}/>

        <Box sx={{mt: "15px", display: "flex", flexDirection: "row"}}>
          <Typography variant="body2" color="text.secondary">
            © 2024 ES410 Group 18, All rights reserved.
          </Typography>
          <Link href="/terms-and-conditions" variant="body2" color="inherit" underline="hover" sx={{ml: "40vh"}}>Terms & Conditions</Link>
          <Link href="/privacy-policy" variant="body2" color="inherit" underline="hover" sx={{ml: "10vh"}}>Privacy Policy</Link>
        </Box>

      </Box>
    </Box>
  );
}

export default Footer;
