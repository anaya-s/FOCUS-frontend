import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Tooltip as ToolTip,
  Container,
} from "@mui/material";
import HourglassDisabledRoundedIcon from "@mui/icons-material/HourglassDisabledRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
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

export default function ReadingTime({ filter }) {
  const [loading, setLoading] = useState(true);
  const [dataLabels, setDataLabels] = useState([]);
  const [dataTotalReadingTimes, setDataTotalReadingTimes] = useState([]);
  const [dataFocusTimes, setDataFocusTimes] = useState([]);
  const [validConnection, setValidConnection] = useState(1);
  const [yAxisScale, setYAxisScale] = useState(59);

  // Toggle for setting Y-axis scale (minutes or seconds)
  const changeYAxis = () => setYAxisScale(yAxisScale === 59 ? 0 : 59);

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
    if (!data) return { dataLabels: [], dataTotalReadingTimes: [], dataFocusTimes: [] };

    let dataLabels, dataTotalReadingTimes, dataFocusTimes;

    if (filter === "user") {
      dataLabels = data.sessions?.map((session) => `${session.session_id}`) || [];
      dataFocusTimes = data.sessions?.map((session) => session.total_focus_time * (60 - yAxisScale)) || [];
      dataTotalReadingTimes = data.sessions?.map(
        (session) => (session.total_reading_time - session.total_focus_time) * (60 - yAxisScale)
      ) || [];
    } else if (filter === "session") {
      dataLabels = data.videos?.map((video) => `${video.video_id}`) || [];
      dataFocusTimes = data.videos?.map((video) => video.total_focus_time * (60 - yAxisScale)) || [];
      dataTotalReadingTimes = data.videos?.map(
        (video) => (video.total_reading_time - video.total_focus_time) * (60 - yAxisScale)
      ) || [];
    } else if (filter === "video") {
      const readingTimes = data.cumulative_reading_time || [];
      const focusTimes = data.cumulative_focus_time || [];

      if (readingTimes.length !== focusTimes.length) {
        console.error("Error: Reading times and Focus times arrays have different lengths");
        return { dataLabels: [], dataTotalReadingTimes: [], dataFocusTimes: [] };
      }

      dataLabels = readingTimes.map((timestamp) => convertToTime(timestamp.timestamp));
      dataFocusTimes = focusTimes.map((timestamp) => timestamp.cumulative_time * (60 - yAxisScale));
      dataTotalReadingTimes = readingTimes.map((timestamp) => timestamp.cumulative_time * (60 - yAxisScale));

      // Ensure total reading time does not exceed focus time
      dataTotalReadingTimes = dataTotalReadingTimes.map((time, index) => time - dataFocusTimes[index]);
    }

    return { dataLabels, dataTotalReadingTimes, dataFocusTimes };
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setValidConnection(1);
        setLoading(true);

        const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-times/?display=${filter}`);
        console.log(filter, "==>", result);

        const { dataLabels, dataTotalReadingTimes, dataFocusTimes } = processData(result);
        setDataLabels(dataLabels);
        setDataTotalReadingTimes(dataTotalReadingTimes);
        setDataFocusTimes(dataFocusTimes);
        setValidConnection(0);
      } catch (err) {
        console.error(err);
        setValidConnection(2);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, yAxisScale]);

  const chartData = {
    labels: dataLabels,
    datasets: [
      {
        label: yAxisScale === 59 ? "Focus Time (Minutes)" : "Focus Time (Seconds)",
        data: dataFocusTimes,
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        borderWidth: 1,
        stack: "combined",
        type: filter === "video" ? "line" : "bar",
      },
      {
        label: yAxisScale === 59 ? "Total Reading Time (Minutes)" : "Total Reading Time (Seconds)",
        data: dataTotalReadingTimes,
        backgroundColor: "rgba(220, 0, 78, 0.2)",
        borderColor: "black",
        borderWidth: 1,
        stack: "combined",
        type: filter === "video" ? "line" : "bar",
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
            ? "Total Reading and Focus Times Across All Sessions"
            : filter === "session"
            ? "Total Reading and Focus Times in Current Session"
            : "Total Reading and Focus Times in Latest Video",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const totalTime = (dataTotalReadingTimes[index] || 0) + (dataFocusTimes[index] || 0);
            return `${context.dataset.label}: ${totalTime.toFixed(3)}`;
          },
        },
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
        title: { display: true, text: yAxisScale === 59 ? "Time (Minutes)" : "Time (Seconds)" },
        beginAtZero: true,
        stacked: true,
      },
      x: {
        title: {
          display: true,
          text: filter === "user" ? "Session ID" : filter === "session" ? "Video ID" : "Timestamp",
        },
        stacked: true,
      },
    },
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: "#f5f5f5",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Button onClick={changeYAxis} sx={{ mb: 2 }} disabled={validConnection === 2 || loading}>
        {yAxisScale === 59 ? (
          <ToolTip title="Show in Seconds">
            <HourglassDisabledRoundedIcon />
          </ToolTip>
        ) : (
          <ToolTip title="Show in Minutes">
            <HourglassEmptyRoundedIcon />
          </ToolTip>
        )}
      </Button>

      <Typography 
        variant="h5" 
        sx={{ mb: 2, fontWeight: "bold", fontSize: "1.5rem" }}
      >
        Reading Times
      </Typography>

      <Container sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? <CircularProgress /> : <Bar data={chartData} options={chartOptions} />}
      </Container>
    </Box>
  );
}
