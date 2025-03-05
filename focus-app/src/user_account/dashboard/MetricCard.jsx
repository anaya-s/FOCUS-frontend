import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import Grid from '@mui/material/Grid2';
// import { reauthenticatingFetch } from '../../utils/api';
import config from '../../config'
// const baseURL = config.apiUrl


export default function ReadingSpeed() {
  const [loading, setLoading] = useState(true);
  const [saccades, setSaccades] = useState(150);
  const [fixations, setFixations] = useState(100);
  const [totalAverageWPM, setTotalAverageWPM] = useState(50);
  const [totalWordsRead, setTotalWordsRead] = useState(1000);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-speed/?display=${filter}`);
        
//         const { totalAverageWPM, totalWordsRead } = processData(result);
//         setTotalAverageWPM(totalAverageWPM);
//         setTotalWordsRead(totalWordsRead);

//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setValidConnection(2);
//         setLoading(true);
//         setTotalAverageWPM(0);
//         setTotalWordsRead(0);
//       }
//     };
//   }, []);

  return (
    <Box>
      <Grid container rowSpacing={2} sx={{ mt: "2vh", mb: "2vh" }}>
        <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
          <Card sx={{ width:160, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardContent>
              <Typography variant="h6">Total Average WPM</Typography>
              <Typography variant="h5" sx={{ color: "green" }}>{totalAverageWPM}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
          <Card sx={{ width:150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardContent>
              <Typography variant="h6">Total Words Read</Typography>
              <Typography variant="h5">{totalWordsRead}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
          <Card sx={{ width:150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardContent>
              <Typography variant="h6">Fixations</Typography>
              <Typography variant="h5">{fixations}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
          <Card sx={{ width:150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardContent>
              <Typography variant="h6">Saccades</Typography>
              <Typography variant="h5">{saccades}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
