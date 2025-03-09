import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Box, Typography, CircularProgress, Container, Button } from "@mui/material";
import { reauthenticatingFetch } from "../../utils/api";
import config from "../../config";

const baseURL = config.apiUrl;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function BlinkRate({ filter }) {
  const [loading, setLoading] = useState(true);
  const [dataLabels, setDataLabels] = useState([]);
  const [blinkData, setBlinkData] = useState([]);
  const [validConnection, setValidConnection] = useState(1);

  const fetchData = async () => {
    try {
      setValidConnection(1);
      setLoading(true);

      const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/blink-rate/?display=${filter}`);

      setDataLabels(result.sessions.map((session) => session.session_id));
      setBlinkData(result.sessions.map((session) => session.blinks_per_minute));

      setLoading(false);
      setValidConnection(0);
    } catch (err) {
      console.error(err);
      setValidConnection(2);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const chartData = {
    labels: dataLabels.length > 0 ? dataLabels : [0, 1, 2, 3, 4], // Placeholder if no data
    datasets: [
      {
        label: "Blinks per Minute",
        data: blinkData.length > 0 ? blinkData : [20, 21, 14, 19, 25], // Placeholder if no data
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "rgba(6, 118, 13, 1)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: false,
      },
      title: {
        display: true,
        text: "Blink Rate",
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "No. of Blinks per Minute",
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: "Session ID",
        },
        beginAtZero: false,
      },
    },
  };

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
        minHeight: "300px",
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ mb: 2, fontWeight: "bold", fontSize: "1.5rem" }}
      >
        Blink Rate
      </Typography>

      <Container
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "250px",
        }}
      >
        {validConnection !== 2 ? (
          loading ? (
            <CircularProgress sx={{ mt: "10vh" }} />
          ) : (
            <Box sx={{ width: "100%", height: "100%", flexGrow: 1, display: "flex", justifyContent: "center" }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          )
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5" sx={{ textAlign: "center", mt: "5vh" }}>
              Connection failed
            </Typography>
            <Button
              variant="contained"
              onClick={fetchData}
              sx={{ mt: "1vh" }}
            >
              Retry
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
