import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { reauthenticatingFetch } from '../../utils/api';
import config from '../../config'
const baseURL = config.apiUrl


export default function ReadingSpeed({filterInput}) {
  const [loading, setLoading] = useState(true);

  const [saccades, setSaccades] = useState(0);
  const [fixations, setFixations] = useState(0);
  const [totalBlinks, setTotalBlinks] = useState(0);
  const [totalAverageWPM, setTotalAverageWPM] = useState(0);
  const [totalWordsRead, setTotalWordsRead] = useState(0);
  const [averageBlinkRate, setAverageBlinkRate] = useState(0);

  function processData(data) {
    var dataOverallAverageReadingSpeed = data.average_wpm;
    var dataTotalWords = data.total_words_read;

    return { totalAverageWPM: dataOverallAverageReadingSpeed, totalWordsRead: dataTotalWords };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-speed/?display=${filterInput.current}`);
        
        const { totalAverageWPM, totalWordsRead } = processData(result);
        setTotalAverageWPM(totalAverageWPM);
        setTotalWordsRead(totalWordsRead);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setValidConnection(2);
        setLoading(true);
        setTotalAverageWPM(0);
        setTotalWordsRead(0);
      }
    };

    fetchData();
  }, [filterInput.current]);

  return (
    <Box>
      <Box sx={{border: "1px solid black", display: "flex", flexDirection: "column", width: "40vw", height: "42vh", mr: "1.5vw", alignItems: "center", justifyContent: "center"}}>
      <Typography variant="h4" sx={{textAlign: "center", mt: "2vh"}}>Eye Metrics</Typography>
        <Grid container columnSpacing={4} rowSpacing={2} sx={{ mt: "2vh", mb: "2vh"}} wrap="wrap" justifyContent="center">
          <Grid xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:200, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Average WPM</Typography>
                <Typography variant="h5" sx={{ color: "green" }}>{totalAverageWPM.toFixed(0)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Total Words Read</Typography>
                <Typography variant="h5">{totalWordsRead.toFixed(0)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Average Blink Rate</Typography>
                <Typography variant="h5">{averageBlinkRate}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Fixations</Typography>
                <Typography variant="h5">{fixations}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Saccades</Typography>
                <Typography variant="h5">{saccades}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Total Blinks</Typography>
                <Typography variant="h5">{totalBlinks}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
