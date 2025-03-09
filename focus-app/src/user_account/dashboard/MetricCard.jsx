import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from "@mui/material";
import { reauthenticatingFetch } from '../../utils/api';
import config from '../../config';

const baseURL = config.apiUrl;

export default function ReadingSpeed({ filter }) {
  const [loading, setLoading] = useState(true);
  const [totalAverageWPM, setTotalAverageWPM] = useState(0);
  const [totalWordsRead, setTotalWordsRead] = useState(0);
  const [saccades, setSaccades] = useState(0);
  const [fixations, setFixations] = useState(0);
  const [validConnection, setValidConnection] = useState(1);

  function processData(data, type) {
    if (!data) return { totalAverageWPM: 0, totalWordsRead: 0, fixations: 0, saccades: 0 };

    if (type === "speed") {
      return {
        totalAverageWPM: data.average_wpm || 0,
        totalWordsRead: data.total_words_read || 0,
      };
    } else {
      return {
        fixations: filter === "user" ? data.avg_fixation_count_per_session || 0 : data.fixation_count || 0,
        saccades: filter === "user" ? data.avg_saccade_count_per_session || 0 : data.saccade_count || 0,
      };
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setValidConnection(1);
        setLoading(true);

        const resultOne = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-speed/?display=${filter}`);
        const { totalAverageWPM, totalWordsRead } = processData(resultOne, "speed");
        setTotalAverageWPM(totalAverageWPM);
        setTotalWordsRead(totalWordsRead);

        const resultTwo = await reauthenticatingFetch("GET", `${baseURL}/api/eye/fix-sacc/?display=${filter}`);
        const { fixations, saccades } = processData(resultTwo, "fix-sacc");
        setFixations(fixations);
        setSaccades(saccades);

        setLoading(false);
        setValidConnection(0);
      } catch (err) {
        console.error(err);
        setValidConnection(2);
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  return (
    <Box
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: "white",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ mb: 2, fontWeight: "bold", fontSize: "1.5rem" }}
      >
        Eye Metrics
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mt: "10vh" }} />
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {[
            { label: "Average WPM", value: totalAverageWPM },
            { label: "Total Words Read", value: totalWordsRead },
            { label: "Fixations", value: fixations },
            { label: "Saccades", value: saccades },
          ].map((metric, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card
                sx={{
                  width: 150,
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <CardContent sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  height: "100%",
                  width: "100%"
                }}>
                  <Typography variant="h6">{metric.label}</Typography>
                  <Typography variant="h5" sx={{ color: "green", fontWeight: "bold" }}>
                    {metric.value.toFixed(0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
