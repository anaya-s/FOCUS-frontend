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
import { Box, Typography, CircularProgress, Container, Button, Tooltip as ToolTip } from "@mui/material";

import {
  Insights as InsightsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

import { reauthenticatingFetch } from "../../utils/api";
import config from "../../config";

const baseURL = config.apiUrl;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function BlinkRate({ filter }) {
  const [loading, setLoading] = useState(true);

  const [dataLabels, setDataLabels] = useState([]);
  const [dataLabelsWithPredictions, setDataLabelsWithPredictions] = useState([]);

  const [blinkData, setBlinkData] = useState([]);
  const [blinkDataAndPredictions, setBlinkDataAndPredictions] = useState([]);

  const [validConnection, setValidConnection] = useState(1);

  const [showPredictions, setShowPredictions] = useState(false);

  // Function to handle showing predictions
  const handleShowPredictions = () => {
    setShowPredictions(!showPredictions);
  };

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
        // Get timestamps strings
        const dataLabels_timestamps = result.blink_rate_over_time.map((blink_rate_over_time) => blink_rate_over_time.timestamp);

        // Convert timestamps to HH:MM:SS (without predictions)
        const dataLabels = dataLabels_timestamps.map((timestamp) => convertToTime(timestamp));

        // Get blink data (without predictions)
        const blinkData = result.blink_rate_over_time.map((blink_rate_over_time) => blink_rate_over_time.blink_rate)

        // Get predictions
        const predictions = result.blink_predictions.lstm_predictions.map((blink_prediction) => blink_prediction);

        // Combine blink data with predictions
        const combinedData = blinkData.concat(predictions);

        /* Need to update dataLabels to include predictions */

        var dataLabelsWithPredictions = []; // Array to store data labels with predictions

        // Get last timestamp as Date object
        var lastTimestamp = new Date(dataLabels_timestamps[dataLabels_timestamps.length - 1]);

        dataLabelsWithPredictions = dataLabels; // Copy data labels to new array

        for(let i = 0; i < predictions.length; i++)
        {
          // Add 1 minute to last timestamp
          lastTimestamp.setMinutes(lastTimestamp.getMinutes() + 1);

          // Convert timestamp to HH:MM:SS and append to the new data labels array
          dataLabelsWithPredictions.push(convertToTime(lastTimestamp));
        }

        console.log("Blink Data:", blinkData);
        console.log("Predictions:", predictions);

        console.log("Combined Data:", dataLabelsWithPredictions, combinedData);

        setDataLabels(result.blink_rate_over_time.map((blink_rate_over_time) => convertToTime(blink_rate_over_time.timestamp)));
        setDataLabelsWithPredictions(dataLabelsWithPredictions);
        
        setBlinkData(blinkData);
        setBlinkDataAndPredictions(combinedData);

        // if(blinkData.length < 5)
        //   setShowPredictions(true); // Show predictions so graph does not look empty
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
  }, [filter, showPredictions]);

  const chartData = {
    labels: (filter === "video" & showPredictions) ? (showPredictions ? (dataLabelsWithPredictions.length > 0 ? dataLabelsWithPredictions : (dataLabels.length > 0 ? dataLabels : [0, 1, 2, 3, 4])) : dataLabels.length > 0 ? dataLabels : [0, 1, 2, 3, 4]) : dataLabels.length > 0 ? dataLabels : [0, 1, 2, 3, 4],
    datasets: [
      {
        data: (filter === "video" & showPredictions) ? (showPredictions ? (blinkDataAndPredictions.length > 0 ? blinkDataAndPredictions : (blinkData.length > 0 ? blinkData : [0, 1, 2, 3, 4])) : blinkData.length > 0 ? blinkData : [0, 1, 2, 3, 4]) : blinkData.length > 0 ? blinkData : [0, 1, 2, 3, 4],
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: (ctx) => {
          if (filter === "video" & showPredictions)
            return ctx.dataIndex < blinkData.length ? "rgba(6, 118, 13, 1)" : "rgba(0, 119, 255, 1)";
          return "rgba(6, 118, 13, 1)";
        },
        segment: {
          borderColor: (ctx) => {
            if (filter === "video" & showPredictions)
              return ctx.p0DataIndex < blinkData.length - 1 ? "rgba(6, 118, 13, 1)" : "rgba(0, 119, 225, 1)";
            return "rgba(6, 118, 13, 1)";
          },
          borderDash: (ctx) => {
            if (filter === "video" & showPredictions)
              return ctx.p0DataIndex < blinkData.length - 1 ? [] : [5, 5];
            return [];
          },
        },
        pointHoverRadius: 5,
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
      tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              if(filter === "video" & showPredictions)
              {
                return index < blinkData.length ? `Blinks per Minute: ${blinkData[index]}` : `Predicted Blinks per Minute: ${blinkDataAndPredictions[index].toFixed(0)}`;
              }
              return `Blinks per Minute: ${blinkData[index]}`;
            }
          }
        }
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
              const fullTime = String(dataLabelsWithPredictions[index]); // Get full timestamp
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
        position: "relative",
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
      <ToolTip title={showPredictions ? "Hide predictions" : "Show predictions"} placement="left">
        <Button onClick={() => handleShowPredictions()}sx={{ position: "absolute", top: 24, right: 10 }} disabled={filter !== "video" || (validConnection === 2 || loading)}>
          {showPredictions ? <TimelineIcon/> : <InsightsIcon/>}
        </Button>
      </ToolTip>
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
