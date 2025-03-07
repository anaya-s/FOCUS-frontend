import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import Grid from '@mui/material/Grid2';
// import { reauthenticatingFetch } from '../../utils/api';
import config from '../../config'
// const baseURL = config.apiUrl


export default function ReadingSpeed({filterInput, data}) {
  const [loading, setLoading] = useState(true);
  // const [saccades, setSaccades] = useState(2870);
  // const [fixations, setFixations] = useState(2989);
  // const [totalAverageWPM, setTotalAverageWPM] = useState(178);
  // const [totalWordsRead, setTotalWordsRead] = useState(3341);

  const [ totalAverageWPM, totalWordsRead, fixations, saccades ] = data.current;

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
      <Box sx={{border: "1px solid black", display: "flex", flexDirection: "column", width: "40vw", height: "42vh", mr: "1.5vw"}}>
      <Typography variant="h4" sx={{textAlign: "center", mt: "2vh"}}>Eye Metrics</Typography>
        <Grid container columnSpacing={4} rowSpacing={2} sx={{ mt: "2vh", mb: "2vh", ml: "10vw"}}>
          <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:200, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Total Average WPM</Typography>
                <Typography variant="h5" sx={{ color: "green" }}>{totalAverageWPM.current}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Total Words Read</Typography>
                <Typography variant="h5">{totalWordsRead.current}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Fixations</Typography>
                <Typography variant="h5">{fixations.current}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={4.01} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width:150, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Typography variant="h6">Saccades</Typography>
                <Typography variant="h5">{saccades.current}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
