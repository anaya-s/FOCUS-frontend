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

  // Convert timestamp to HH:MM:SS
  const convertToTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const fetchData = async () => {
    try {
      setValidConnection(1);
      setLoading(true);

      const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/blink-rate/?display=${filter}`);

      console.log(filter, "=>", result);

      if(filter === "user")
      {
        setDataLabels(result.sessions.map((session) => session.session_id));
        setBlinkData(result.sessions.map((session) => session.blink_rate));
      } 
      else if(filter === "session")
      {
        setDataLabels(result.videos.map((video) => video.video_id));
        setBlinkData(result.videos.map((video) => video.blink_rate));
      }
      else // filter === "video"
      {
        setDataLabels(result.blink_rate_over_time.map((blink_rate_over_time) => convertToTime(blink_rate_over_time.timestamp)));
        setBlinkData(result.blink_rate_over_time.map((blink_rate_over_time) => blink_rate_over_time.blink_rate));
      }


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
        display: false,
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
          text: filter === "user" ? "Session ID" : filter === "session" ? "Video ID" : "Timestamp",
        },
        ticks: {
          callback: function (value, index, values) {
            if(filter === "video")
            {
              const fullTime = String(dataLabels[index]); // Get full timestamp
              return fullTime ? fullTime.slice(0, 5) : ""; // Show only HH:MM
            }
            return value;
          },
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
        minHeight: "358px",
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
            <CircularProgress/>
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
            <Typography variant="h5" sx={{ textAlign: "center" }}>
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
