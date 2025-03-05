import { useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Paper from "@mui/material/Paper";
import { Typography, Button, Container } from '@mui/material';
import BlinkRate from './BlinkRate';
import ReadingTime from './ReadingTime';
import ReadingSpeed from './ReadingSpeed';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TheatersRoundedIcon from '@mui/icons-material/TheatersRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

const dashboardStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '80vh',
  marginTop: "5vh",
  padding: '24px',
  maxWidth: '100vw', 
  textAlign: 'center',
  alignContent: 'center',
  justifyContent: 'center',
  alignText: "center",
};

const validConnection = 1;
const loading = false;
const filter = "user";

const DashboardOverall = () => {

  useEffect(() => {
    document.body.style.overflow = 'auto'; // re-enable scrolling if disabled by any other page

    window.scrollTo({ top: 0}); // auto-scroll to the top
  }, []);

  return (
    <Container style={dashboardStyle}>
      <Typography variant='h3'>Welcome to your dashboard!</Typography>
      <Container sx={{display: "flex", justifyContent: "space-evenly", flexDirection: "row", mt: "2vh", mb: "2vh", width: "100vw"}}>
        {/* <Button onClick={() => changeYAxis()} variant="outlined" disabled={validConnection === 2 || loading}>{yAxisScale === 59 ? "Switch to seconds" : "Switch to minutes"}</Button>
        <Divider orientation="vertical" flexItem /> */}
        <Button onClick={() => handleFilter("user")} variant={filter === "user" ? "contained" : "outlined"} disabled={validConnection === 2 || loading}><PersonRoundedIcon/></Button>
        <Button onClick={() => handleFilter("session")} variant={filter === "session" ? "contained" : "outlined"} disabled={validConnection === 2 || loading}><TheatersRoundedIcon/></Button>
        <Button onClick={() => handleFilter("video")} variant={filter === "video" ? "contained" : "outlined"} disabled={validConnection === 2 || loading}><ScheduleRoundedIcon/></Button>
      </Container>
      <Grid container columnSpacing={5}>
        <Grid size={6}>
          <ReadingSpeed/>
        </Grid>
        <Grid size={6}>
          <BlinkRate/>
        </Grid>
        <Grid size={6}>
          <ReadingTime/>
        </Grid>
        <Grid size={6}>

        </Grid>
      </Grid>
    </Container>
  )
}

export default DashboardOverall