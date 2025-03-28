import { useEffect, useRef, useState } from 'react';
import { Container, Grid, Box, Typography, Button } from '@mui/material';
import BlinkRate from './BlinkRate';
import ReadingTime from './ReadingTime';
import ReadingSpeed from './ReadingSpeed';
import MetricCard from './MetricCard';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TheatersRoundedIcon from '@mui/icons-material/TheatersRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

const DashboardOverall = () => {
  const [filter, setFilter] = useState("user");
  const filterRef = useRef("user");

  const handleFilter = async (newFilter) => {
    if (filter !== newFilter) {
      setFilter(newFilter);
      filterRef.current = newFilter;
      console.log("Filter set to:", filterRef.current);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'auto';
    window.scrollTo({ top: 0 });
    filterRef.current = filter;
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2}>
        
        {/* Filter Buttons */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" gap={2}>
            {/* <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
              Filter by:
            </Typography> */}
            <Button 
              onClick={() => handleFilter("user")} 
              variant={filter === "user" ? "contained" : "outlined"}>
              <PersonRoundedIcon sx={{mr: "1vw"}}/> User
            </Button>
            <Button 
              onClick={() => handleFilter("session")} 
              variant={filter === "session" ? "contained" : "outlined"}>
              <TheatersRoundedIcon sx={{mr: "1vw"}}/> Session
            </Button>
            <Button 
              onClick={() => handleFilter("video")} 
              variant={filter === "video" ? "contained" : "outlined"}>
              <ScheduleRoundedIcon sx={{mr: "1vw"}}/> Video
            </Button>
          </Box>
        </Grid>

        {/* Eye Metrics Panel */}
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: "#F3F5F9", p: 2, borderRadius: 2 }}>
            <MetricCard filter={filter} />
          </Box>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: "#F3F5F9", p: 2, borderRadius: 2 }}>
            <ReadingSpeed filter={filter} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: "#F3F5F9", p: 2, borderRadius: 2 }}>
            <BlinkRate filter={filter} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: "#F3F5F9", p: 2, borderRadius: 2 }}>
            <ReadingTime filter={filter} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardOverall;