import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Container,
} from "@mui/material";
import { reauthenticatingFetch } from "../../utils/api";
import config from "../../config";

const baseURL = config.apiUrl;

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

export default function ReadingSpeed({ filter }) {
  const [loading, setLoading] = useState(true);
  const [dataLabels, setDataLabels] = useState([]);
  const [yData, setYData] = useState([]);
  const [totalAverageWPM, setTotalAverageWPM] = useState(0);
  const [totalWordsRead, setTotalWordsRead] = useState(0);
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

  function processData(data) {
    if (!data) return { dataLabels: [], yDataValues: [], totalAverageWPM: 0, totalWordsRead: 0 };

    let dataLabels, yDataValues;
    let totalAverageWPM = data.average_wpm || 0;
    let totalWordsRead = data.total_words_read || 0;

    if (filter === "user") {
      dataLabels = data.sessions?.map(session => `${session.session_id}`) || [];
      yDataValues = data.sessions?.map(session => session.average_wpm.toFixed(0)) || [];
    } else if (filter === "session") {
      dataLabels = data.videos?.map(video => `${video.video_id}`) || [];
      yDataValues = data.videos?.map(video => video.average_wpm.toFixed(0)) || [];
    } else if (filter === "video") {
      const readingSpeeds = data.reading_speed_over_time || [];
      dataLabels = readingSpeeds.map(entry => convertToTime(entry.timestamp));
      yDataValues = readingSpeeds.map(entry => entry.wpm);
    }

    return { dataLabels, yDataValues, totalAverageWPM, totalWordsRead };
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setValidConnection(1);
        setLoading(true);
        const result = await reauthenticatingFetch(
          "GET",
          `${baseURL}/api/eye/reading-speed/?display=${filter}`
        );

        console.log(filter, "==>", result);

        const { dataLabels, yDataValues, totalAverageWPM, totalWordsRead } = processData(result);
        setDataLabels(dataLabels);
        setYData(yDataValues);
        setTotalAverageWPM(totalAverageWPM);
        setTotalWordsRead(totalWordsRead);

        setLoading(false);
        setValidConnection(0);
      } catch (err) {
        console.error(err);
        setValidConnection(2);
        setLoading(false);
        setDataLabels([]);
        setYData([]);
        setTotalAverageWPM(0);
        setTotalWordsRead(0);
      }
    };

    fetchData();
  }, [filter]);

  const chartData = {
    labels: dataLabels,
    datasets: [
      {
        label: "Reading Speed (WPM)",
        data: yData,
        borderWidth: 1,
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        type: filter === "video" ? "line" : "bar",
        pointRadius: 0.25,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", display: true },
      title: {
        display: true,
        text:
          filter === "user"
            ? "Average Reading Speed Across All Sessions"
            : filter === "session"
            ? "Average Reading Speed in Current Session"
            : "Average Reading Speed in Latest Video",
      },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
          limits: { x: { min: 0 }, y: { min: 0 } },
        },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Reading Speed (Words per Minute)" },
        beginAtZero: true,
        suggestedMin: 0,
      },
      x: {
        title: {
          display: true,
          text:
            filter === "user"
              ? "Session ID"
              : filter === "session"
              ? "Video ID"
              : "Timestamp",
        },
        min: 0,
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
        Reading Speed
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
              <Bar data={chartData} options={chartOptions} />
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
              onClick={() => fetchData()}
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
