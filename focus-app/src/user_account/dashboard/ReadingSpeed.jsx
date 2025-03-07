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
export default function ReadingSpeed({filterInput}) {
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
    const [filter, setFilter] = useState(filterInput.current);
    const [filterBeforeDisconnect, setFilterBeforeDisconnect] = useState("user");
    const updateYAxis = useRef(false);
  
    useEffect(() => {
      if(filter !== filterInput.current)
      {
        console.log("second setting: ", filterInput.current);
        setFilter(filterInput.current);
      }
    }, [filterInput.current]);

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

      return { dataLabels, yDataValues: dataReadingSpeedOverTime, totalAverageWPM: dataOverallAverageReadingSpeed, totalWordsRead: dataTotalWords };
    }

    if(filter == "user")
    {
      dataLabels = datamap.map((session) => `${session.session_id}`);
      averageReadingSpeed = datamap.map((session) => session.average_wpm.toFixed(0));
    }
    else if(filter == "session")
    {
      dataLabels = datamap.map((videos) => `${videos.video_id}`);
      averageReadingSpeed = datamap.map((videos) => videos.average_wpm.toFixed(0));
    }

    console.log(dataLabels, averageReadingSpeed);

    return { dataLabels, yDataValues: averageReadingSpeed, totalAverageWPM: dataOverallAverageReadingSpeed, totalWordsRead: dataTotalWords };
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
        setLoading(true);
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

  }, [filter]);

  const chartData = {
    labels: dataLabels,
    datasets: [
      {
        label: "Reading speed (wpm)",
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
        suggestedMin: 0, // Ensures the Y-axis does not go below zero
      },
      x: {
        title: {
          display: true,
          text: filter === "user" ? "Session ID" : filter === "session" ? "Video ID" : "Timestamp",
        },
        min: 0, // Ensures the X-axis does not go below zero
      },
    },
  };
  
  


  return (
    <Box>
        <Box sx={{border: "1px solid black", display: "flex", flexDirection: "column", width: "40vw", height: "42vh"}}>
          <Typography variant="h4" sx={{textAlign: "center", mt: "2vh"}}>Reading Speed</Typography>
          <Container sx={{ width: "40vw", display: "flex", alignItems: "center", justifyContent: "center"}}>
                  {validConnection !== 2 ?
                  loading ? <CircularProgress sx={{mt: "10vh"}}/> : <Bar data={chartData} options={chartOptions}/> 
                  :
                  <Container>
                      <Typography variant="h5" sx={{textAlign: "center", mt: "5vh"}}>Connection failed</Typography>
                      <Button variant="contained" onClick={() => handleFilter(filterBeforeDisconnect)} sx={{mt: "1vh"}}>Retry</Button>
                  </Container>
                  }
          </Container>
        </Box>
    </Box>
  );
}

        {/* <Box sx={{display: "flex", flexDirection: "column", mt: "2vh"}}>
            <Container sx={{display: "flex", justifyContent: "space-between", flexDirection: "row", mb: "2vh"}}>
                <Container>
                    <Typography variant="h5" sx={{border: "1px solid black", height: "10vh", alignContent: "center"}}>Total average reading speed: {totalAverageWPM} wpm</Typography>
                </Container>
                <Container>
                    <Typography variant="h5" sx={{border: "1px solid black", height: "10vh", alignContent: "center"}}>Total words read: {totalWordsRead}</Typography>
                </Container>
            </Container>
        </Box> */}