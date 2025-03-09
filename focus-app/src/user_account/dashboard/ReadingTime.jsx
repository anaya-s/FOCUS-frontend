import { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, CircularProgress, Divider, Alert, Typography, Tooltip as ToolTip } from "@mui/material";
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

import HourglassDisabledRoundedIcon from '@mui/icons-material/HourglassDisabledRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);
export default function ReadingTime({filterInput}) {
  const [loading, setLoading] = useState(true);
  const [dataLabels, setdataLabels] = useState([]);
  const [dataTotalReadingTimes, setdataTotalReadingTimes] = useState([]);
  const [dataFocusTimes, setdataFocusTimes] = useState([]);

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
    var dataFocusTimes = null;
    var dataTotalReadingTimes = null;

    if(filter == "user")
    {
      datamap = data.sessions;
      console.log(datamap);
    }
    else if(filter == "session")
    {
      datamap = data.videos;
      console.log(datamap);
    }
    else
    {
      const reading_times = data.cumulative_reading_time;
      const focus_times = data.cumulative_focus_time;

      if(reading_times.length != focus_times.length)
      {
        console.error("Error: Reading times and Focus times are not of the same length");
        return;
      }

      dataLabels = reading_times.map((timestamp) => convertToTime(timestamp.timestamp));
      dataFocusTimes = focus_times.map((timestamp) => timestamp.cumulative_time * (60 - yAxisScale));
      dataTotalReadingTimes =  reading_times.map((timestamp) => timestamp.cumulative_time * (60 - yAxisScale));

      dataTotalReadingTimes = dataTotalReadingTimes.map((time, index) => time - dataFocusTimes[index]);

    }

    if(filter == "user")
    {
      dataLabels = datamap.map((session) => `${session.session_id}`);
      dataFocusTimes = datamap.map((session) => session.total_focus_time * (60 - yAxisScale));
      dataTotalReadingTimes = datamap.map((session) => (session.total_reading_time - session.total_focus_time) * (60 - yAxisScale));
    }
    else if(filter == "session")
    {
      dataLabels = datamap.map((videos) => `${videos.video_id}`);
      dataFocusTimes = datamap.map((videos) => videos.total_focus_time * (60 - yAxisScale));
      dataTotalReadingTimes = datamap.map((videos) => (videos.total_reading_time - videos.total_focus_time) *(60 - yAxisScale));
    }
  
    return { dataLabels, dataTotalReadingTimes, dataFocusTimes };
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
      setdataTotalReadingTimes([]);
      setdataFocusTimes([]);
      setFilter(newFilter);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setValidConnection(1);
        setLoading(true);
        const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-times/?display=${filter}`);

        console.log(filter, "==>", result);

        const { dataLabels, dataTotalReadingTimes, dataFocusTimes } = processData(result);
        setdataLabels(dataLabels);
        setdataTotalReadingTimes(dataTotalReadingTimes);
        setdataFocusTimes(dataFocusTimes);
        setLoading(false);
        setValidConnection(0);
      } catch (err) {
        console.error(err);

        setValidConnection(2);
        setLoading(true);

        setFilterBeforeDisconnect(filter);
        setFilter("");
        setdataLabels([]);
        setdataTotalReadingTimes([]);
        setdataFocusTimes([]);
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
        label: yAxisScale === 59 ? "Focus time (minutes)" : "Focus time (seconds)",
        data: dataFocusTimes,
        borderWidth: 1,
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        stack: 'combined',
        type: filter === "video" ? "line" : "bar",
        pointRadius: 0.25,
        pointHoverRadius: 5,
      },
      {
        label: yAxisScale === 59 ? "Total reading time (minutes)" : "Total reading time (seconds)",
        data: dataTotalReadingTimes,
        borderWidth: 1,
        backgroundColor: "rgba(220, 0, 78, 0.2)",
        borderColor: "black",
        stack: 'combined',
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
        text: !loading ? 
        filter === "user"
          ? "Total Reading and Focus Times across all sessions"
          : filter === "session"
          ? "Total Reading and Focus Times in current session"
          : "Total Reading and Focus Times in latest video"
        :
        "",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            if (context.dataset.label === "Total reading time (seconds)" | context.dataset.label === "Total reading time (minutes)") {
              if(yAxisScale === 59)
                return `Total reading time (minutes): ${(dataTotalReadingTimes[index] + dataFocusTimes[index]).toFixed(3)}`;
              else
                return `Total reading time (seconds): ${(dataTotalReadingTimes[index] + dataFocusTimes[index]).toFixed(3)}`;
            }
            return `${context.dataset.label}: ${context.raw.toFixed(3)}`;
          },
        },
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
          text: yAxisScale === 59 ? "Time (minutes)" : "Time (seconds)",
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
    <div style={{border: "1px solid black", display: "flex", flexDirection: "column", width: "40vw", height: "42vh"}}>
      <Button onClick={() => changeYAxis()} sx={{display: "absolute", left: "1vw", top: "2vh", width: "10%", marginBottom: 0, padding: 0}} disabled={validConnection === 2 || loading}>{yAxisScale === 59 ? <ToolTip title={"Show in seconds"} placement="right"><HourglassDisabledRoundedIcon/></ToolTip> : <ToolTip title={"Show in minutes"} placement="left"><HourglassEmptyRoundedIcon/></ToolTip>}</Button>
      <Typography variant="h4" sx={{textAlign: "center"}}>Reading Times</Typography>
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
    </div>
  );
}