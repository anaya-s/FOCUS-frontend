import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, CircularProgress, Divider } from "@mui/material";
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
export default function ReadingTime() {
  const [loading, setLoading] = useState(true);
  const [dataLabels, setdataLabels] = useState([]);
  const [dataTotalReadingTimes, setdataTotalReadingTimes] = useState([]);
  const [dataFocusTimes, setdataFocusTimes] = useState([]);


  /* Set filter when displaying data
    "user" - display all data
    "session" - display data per session
    "video" - display data per video
  */
  const [filter, setFilter] = useState("user");

  const convertToTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  function processData(data) {
    var datamap = null;
    var dataLabels = null;
    var dataFocusTimes = null;
    var dataTotalReadingTimes = null;

    if(filter == "user")
      datamap = data.sessions;
    else if(filter == "session")
      datamap = data.videos;
    else
    {
      const reading_times = data.cumulative_reading_time;
      const focus_times = data.cumulative_focus_time;
      console.log(reading_times, "-----------", focus_times);

      if(reading_times.length != focus_times.length)
      {
        console.error("Error: Reading times and Focus times are not of the same length");
        return;
      }

      dataLabels = reading_times.map((timestamp) => convertToTime(timestamp.timestamp));
      dataFocusTimes = focus_times.map((timestamp) => timestamp.cumulative_time * 60);
      dataTotalReadingTimes =  reading_times.map((timestamp) => timestamp.cumulative_time * 60);

      // console.log(dataFocusTimes);
      console.log(dataTotalReadingTimes);

      dataTotalReadingTimes = dataTotalReadingTimes.map((time, index) => time - dataFocusTimes[index]);

      console.log(dataTotalReadingTimes);

    }

    if(filter == "user")
    {
      dataLabels = datamap.map((session) => `${session.session_id}`);
      dataFocusTimes = datamap.map((session) => session.total_focus_time * 60);
      dataTotalReadingTimes = datamap.map((session) => (session.total_reading_time - session.total_focus_time) * 60);
    }
    else if(filter == "session")
    {
      dataLabels = datamap.map((videos) => `${videos.video_id}`);
      dataFocusTimes = datamap.map((videos) => videos.total_focus_time * 60);
      dataTotalReadingTimes = datamap.map((videos) => (videos.total_reading_time - videos.total_focus_time) * 60);
    }
  
    return { dataLabels, dataTotalReadingTimes, dataFocusTimes };
  }

  const handleFilter = async(newFilter) => {
    if(filter !== newFilter)
    {
      setLoading(true);
      // Clear previous data
      setdataLabels([]);
      setdataTotalReadingTimes([]);
      setdataFocusTimes([]);
      setFilter(newFilter);
      console.log(`Filter set to ${newFilter}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-times/?display=${filter}`);

        console.log(filter, "==>", result);

        const { dataLabels, dataTotalReadingTimes, dataFocusTimes } = processData(result);
        setdataLabels(dataLabels);
        setdataTotalReadingTimes(dataTotalReadingTimes);
        setdataFocusTimes(dataFocusTimes);
        setLoading(false);
      } catch (err) {
        console.error(err);
        // Show alert for failed connection and set all datasets to empty
      }
    };

    fetchData();
  }, [filter]);

  const chartData = {
    labels: dataLabels,
    datasets: [
      {
        label: "Focus time (seconds)",
        data: dataFocusTimes,
        borderWidth: 1,
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        stack: 'combined',
        type: filter === "video" ? "line" : "bar",
        pointRadius: dataLabels.length < 250 ? 2 : 0,
        pointHoverRadius: 4,
      },
      {
        label: "Total reading time (seconds)",
        data: dataTotalReadingTimes,
        borderWidth: 1,
        backgroundColor: "rgba(220, 0, 78, 0.2)",
        borderColor: "black",
        stack: 'combined',
        type: filter === "video" ? "line" : "bar",
        pointRadius: dataLabels.length < 250 ? 2 : 0,
        pointHoverRadius: 4,
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
          ? "Total Reading and Focus Times across all sessions"
          : filter === "session"
          ? "Total Reading and Focus Times in current session"
          : "Total Reading and Focus Times in latest video",
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
          text: "Time (seconds)",
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
        {loading ? <CircularProgress /> : <Bar data={chartData} options={chartOptions}/>}
      </Container>
      <Divider />
      <Container sx={{display: "flex", justifyContent: "space-evenly", flexDirection: "row", mt: "2vh", mb: "2vh"}}>
      <Button onClick={() => handleFilter("user")} variant={filter === "user" ? "contained" : "outlined"}>User</Button>
      <Button onClick={() => handleFilter("session")} variant={filter === "session" ? "contained" : "outlined"}>Session</Button>
      <Button onClick={() => handleFilter("video")} variant={filter === "video" ? "contained" : "outlined"}>Video</Button>
      </Container>
    </Box>
  );
}