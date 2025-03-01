import { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, CircularProgress, Divider, Alert, Typography } from "@mui/material";
import { reauthenticatingFetch } from '../../utils/api';
import config from '../../config'
const baseURL = config.apiUrl

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Container } from "@mui/system";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);
export default function ReadingSpeed() {
  const [loading, setLoading] = useState(true);
  const [dataLabels, setdataLabels] = useState([]);
  const [yData, setYData] = useState([]);
  const [totalAverageWPM, setTotalAverageWPM] = useState(0);
  const [totalWordsRead, setTotalWordsRead] = useState(0);

  /*
  Status of connection to backend server
    2 - connection failed
    1 - connection in progress
    0 - connection successful
  */
  const [validConnection, setValidConnection] = useState(1);

  /* Set filter when displaying data
    "user" - display all data
    "session" - display data per session
    "video" - display data per video
  */
  const [filter, setFilter] = useState("user");
  const [filterBeforeDisconnect, setFilterBeforeDisconnect] = useState("user");
  const updateYAxis = useRef(false);

  /* Toggle for setting y-axis scale to seconds or minutes 
  - 59 - minutes
  - 0 - seconds
  */
  const [yAxisScale, setYAxisScale] = useState(59);

  // Used to convert timestamp to time in HH:MM:SS format for x-axis
  const convertToTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  function processData(data) {
    var datamap = null;
    var dataLabels = null;

    var dataReadingSpeedOverTime = null;
    var averageReadingSpeed = null;
    
    var dataOverallAverageReadingSpeed = data.average_wpm;
    var dataTotalWords = data.total_words_read;

    if(filter == "user")
      datamap = data.sessions;
    else if(filter == "session")
      datamap = data.videos;
    else
    {
      const reading_speeds = data.reading_speed_over_time;

      dataLabels = reading_speeds.map((timestamp) => convertToTime(timestamp.timestamp));
      dataReadingSpeedOverTime =  reading_speeds.map((timestamp) => timestamp.wpm);

      return { dataLabels, dataReadingSpeedOverTime, dataOverallAverageReadingSpeed, dataTotalWords };
    }

    if(filter == "user")
    {
      dataLabels = datamap.map((session) => `${session.session_id}`);
      averageReadingSpeed = datamap.map((session) => session.average_wpm);
    }
    else if(filter == "session")
    {
      dataLabels = datamap.map((videos) => `${videos.video_id}`);
      averageReadingSpeed = datamap.map((videos) => videos.average_wpm);
    }

    console.log(dataLabels, averageReadingSpeed);

    return { dataLabels, averageReadingSpeed, dataOverallAverageReadingSpeed, dataTotalWords };
  }

  const changeYAxis = () => {

    if(yAxisScale === 59)
      setYAxisScale(0); // seconds
    else
      setYAxisScale(59); // minutes

    // update data
    updateYAxis.current = true;
    setLoading(true);
  }

  const handleFilter = async(newFilter) => {
    if(filter !== newFilter)
    {
      setLoading(true);
      // Clear previous data
      setdataLabels([]);
      setYData([]);
      setTotalAverageWPM(0);
      setTotalWordsRead(0);
      setFilter(newFilter);
      // console.log(`Filter set to ${newFilter}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setValidConnection(1);
        const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-speed/?display=${filter}`);

        console.log(filter, "==>", result);

        const { dataLabels, yDataValues, totalAverageWPM, totalWordsRead } = processData(result);
        setdataLabels(dataLabels);
        setYData(yDataValues);
        setTotalAverageWPM(totalAverageWPM);
        setTotalWordsRead(totalWordsRead);

        setLoading(false);
        setValidConnection(0);
      } catch (err) {
        console.error(err);

        setValidConnection(2);
        setLoading(true);

        setFilterBeforeDisconnect(filter);
        setFilter("");
        setdataLabels([]);
        setYData([]);
        setTotalAverageWPM(0);
        setTotalWordsRead(0);
      }
    };

    if(filter !== "")
      fetchData();

    updateYAxis.current = false;

  }, [filter, updateYAxis.current]);

  const chartData = {
    labels: dataLabels,
    datasets: [
      {
        label: "Reading speed (wpm)",
        data: yData,
        borderWidth: 1,
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        stack: 'combined',
        type: filter === "video" ? "line" : "bar",
        pointRadius: 0.25,
        pointHoverRadius: 5,
      },
      {
        // Add vertical line on graph for overall average reading speed
      },
    ],
  };
  

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: true,
      },
      title: {
        display: true,
        text: filter === "user"
          ? "Average reading speed across all sessions"
          : filter === "session"
          ? "Average reading speed in current session"
          : "Average reading speed in latest video",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
          limits: {
            x: { min: 0 }, // Prevent negative zoom on the x-axis
            y: { min: 0 }, // Prevent negative zoom on the y-axis
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Reading speed (words per minute)",
        },
        beginAtZero: true, // Prevents negative values
        stacked: true,
        suggestedMin: 0, // Ensures the Y-axis does not go below zero
      },
      x: {
        title: {
          display: true,
          text: filter === "user" ? "Session ID" : filter === "session" ? "Video ID" : "Timestamp",
        },
        stacked: true,
        min: 0, // Ensures the X-axis does not go below zero
      },
    },
  };
  
  


  return (
    <Box sx={{border: "1px solid black", display: "flex", flexDirection: "column"}}>
      <Container sx={{height: "30vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
        {validConnection !== 2 ?
          loading ? <CircularProgress /> : <Bar data={chartData} options={chartOptions}/> 
          :
          <Container>
            <Typography variant="h5" sx={{textAlign: "center", mt: "5vh"}}>Connection failed</Typography>
            <Button variant="contained" onClick={() => handleFilter(filterBeforeDisconnect)} sx={{mt: "1vh"}}>Retry</Button>
          </Container>
        }
      </Container>
      <Divider />
      <Container sx={{display: "flex", justifyContent: "space-evenly", flexDirection: "row", mt: "2vh", mb: "2vh"}}>
      {/* <Button onClick={() => changeYAxis()} variant="outlined" disabled={validConnection === 2 || loading}>{yAxisScale === 59 ? "Switch to seconds" : "Switch to minutes"}</Button>
      <Divider orientation="vertical" flexItem /> */}
      <Button onClick={() => handleFilter("user")} variant={filter === "user" ? "contained" : "outlined"} disabled={validConnection === 2 || loading}>User</Button>
      <Button onClick={() => handleFilter("session")} variant={filter === "session" ? "contained" : "outlined"} disabled={validConnection === 2 || loading}>Session</Button>
      <Button onClick={() => handleFilter("video")} variant={filter === "video" ? "contained" : "outlined"} disabled={validConnection === 2 || loading}>Video</Button>
      </Container>
    </Box>
  );
}