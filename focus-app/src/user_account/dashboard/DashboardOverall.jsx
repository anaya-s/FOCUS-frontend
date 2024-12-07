import Grid from '@mui/material/Grid2';
import Paper from "@mui/material/Paper";
import { Typography } from '@mui/material';
import BlinkRate from './BlinkRate';
import ReadingTime from './ReadingTime';

const dashboardStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  padding: '24px',
  maxWidth: '1000px', 
  textAlign: 'center'
};


const DashboardOverall = () => {
  return (
    <div style={dashboardStyle}>
      <Typography variant='h3'>Welcome to your dashboard!</Typography>
      <Grid container spacing={2} style={{ padding: "16px", display: 'flex', flexDirection: 'column',}}>
        <Grid item xs={24} sm={12} md={12}>
          <ReadingTime />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <BlinkRate />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper style={{ padding: "16px" }}>Chart 3</Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default DashboardOverall