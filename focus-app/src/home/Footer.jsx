import React from 'react';
import { Box, Typography, Grid2, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      sx={{ 
        backgroundColor: '#f5f5f5', 
        p: 4, 
        mt: 'auto',
        marginTop: 10,
        
      }}
      component="footer"
    >
      <Grid2 container spacing={6}>
        <Grid2 item xs={12} sm={4}>
          <Typography variant="h6">Company</Typography>
          <Typography variant="body2" color="text.secondary">
            © 2024 Your Company
          </Typography>
        </Grid2>
        
        <Grid2 item xs={12} sm={4}>
          <Typography variant="h6">Quick Links</Typography>
          <Link href="#" variant="body2" color="inherit" underline="hover">About Us</Link><br />
          <Link href="#" variant="body2" color="inherit" underline="hover">Contact</Link><br />
          <Link href="#" variant="body2" color="inherit" underline="hover">Privacy Policy</Link>
        </Grid2>

        <Grid2 item xs={12} sm={4}>
          <Typography variant="h6">Follow Us</Typography>
          <Link href="#" variant="body2" color="inherit" underline="hover">Facebook</Link><br />
          <Link href="#" variant="body2" color="inherit" underline="hover">Twitter</Link><br />
          <Link href="#" variant="body2" color="inherit" underline="hover">Instagram</Link>
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default Footer;
