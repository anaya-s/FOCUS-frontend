import { useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Paper from "@mui/material/Paper";
import { Typography } from '@mui/material';
import BlinkRate from './BlinkRate';
import ReadingTime from './ReadingTime';
import ReadingSpeed from './ReadingSpeed';

const dashboardStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  padding: '24px',
  maxWidth: '1000px', 
  textAlign: 'center'
};

const DashboardOverall = () => {

  useEffect(() => {
    document.body.style.overflow = 'auto'; // re-enable scrolling if disabled by any other page

    window.scrollTo({ top: 0}); // auto-scroll to the top
  }, []);

  return (
    <div style={dashboardStyle}>
      <Typography variant='h3'>Welcome to your dashboard!</Typography>
      <Grid container spacing={2} style={{ padding: "16px", display: 'flex', flexDirection: 'column',}}>
        <Grid item xs={24} sm={12} md={12}>
          <ReadingTime />
        </Grid>
        {/* <Grid item xs={12} sm={12} md={12}>
          <BlinkRate />
        </Grid> */}
        {/* <Grid item xs={12} sm={12} md={12}>
          <ReadingSpeed />
        </Grid> */}
      </Grid>
    </div>
  )
}

export default DashboardOverall