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
        // console.log(filter, "==>", result);

        var { dataLabels, dataTotalReadingTimes, dataFocusTimes } = processData(result);

        function filterUniqueTimestamps(labels, totalReadingTimes, focusTimes) {
            let seen = new Set();
            let filteredLabels = [];
            let filteredTotalReadingTimes = [];
            let filteredFocusTimes = [];
        
            for (let i = 0; i < labels.length; i++) {
                if (!seen.has(labels[i])) {
                    seen.add(labels[i]);
                    filteredLabels.push(labels[i]);
                    filteredTotalReadingTimes.push(totalReadingTimes[i]);
                    filteredFocusTimes.push(focusTimes[i]);
                }
            }
        
            return { filteredLabels, filteredTotalReadingTimes, filteredFocusTimes };
        }
        
        const { filteredLabels, filteredTotalReadingTimes, filteredFocusTimes } = 
            filterUniqueTimestamps(dataLabels, dataTotalReadingTimes, dataFocusTimes);

        setDataLabels(filteredLabels);
        setDataTotalReadingTimes(filteredTotalReadingTimes);
        setDataFocusTimes(filteredFocusTimes);
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
        pointRadius: 1,
        pointHoverRadius: 5,
      },
      {
        label: yAxisScale === 59 ? "Total Reading Time (Minutes)" : "Total Reading Time (Seconds)",
        data: dataTotalReadingTimes,
        backgroundColor: "rgba(220, 0, 78, 0.2)",
        borderColor: "black",
        borderWidth: 1,
        stack: "combined",
        type: filter === "video" ? "line" : "bar",
        pointRadius: 1,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", display: true },
      // title: {
      //   display: true,
      //   text:
      //     filter === "user"
      //       ? "Total Reading and Focus Times Across All Sessions"
      //       : filter === "session"
      //       ? "Total Reading and Focus Times in Current Session"
      //       : "Total Reading and Focus Times in Latest Video",
      // },
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
        ticks: {
          autoSkip: true, // skip labels to prevent clutter
          ...(filter === "video" && { maxTicksLimit: dataLabels.length  / 8}) // Adjust the number of labels displayed (may need to reduce further if changing graph size)
        },
      },
    },
  };

  return (
    <Box
      sx={{
        position: "relative", // Make the Box a reference for absolute positioning
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
      <ToolTip title={yAxisScale === 59 ? "Show in Seconds" : "Show in Minutes"} placement="right">
        <Button onClick={changeYAxis} sx={{ position: "absolute", top: 24, left: 10 }} disabled={validConnection === 2 || loading}>
          {yAxisScale === 59 ? (
            <HourglassDisabledRoundedIcon />
          ) : (
            <HourglassEmptyRoundedIcon />
          )}
        </Button>
      </ToolTip>
  
      {/* Title - Centered at the Top */}
      <Typography
        variant="h5"
        sx={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)", // Center it horizontally
          fontWeight: "bold",
          fontSize: "1.5rem",
          mb: 2
        }}
      >
        Reading Times
      </Typography>
  
      {/* Chart Container */}
      <Container
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: 5, // Add margin-top to avoid overlap
        }}
      >
        {loading ? <CircularProgress /> : <Bar data={chartData} options={chartOptions} />}
      </Container>
    </Box>
  );
}
