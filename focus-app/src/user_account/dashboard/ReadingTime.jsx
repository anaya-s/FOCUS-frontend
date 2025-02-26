import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { CircularProgress } from "@mui/material";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function processData(data) {
  const sessionLabels = data.sessions.map((session) => `${session.session_id}`);
  const sessionFocusTimes = data.sessions.map((session) => session.total_focus_time);
  const sessionTotalReadingTimes = data.sessions.map((session) => session.total_reading_time - session.total_focus_time);

  return { sessionLabels, sessionTotalReadingTimes, sessionFocusTimes };
}

export default function ReadingTime() {
  const [loading, setLoading] = useState(true);
  const [sessionLabels, setSessionLabels] = useState([]);
  const [sessionTotalReadingTimes, setSessionTotalReadingTimes] = useState([]);
  const [sessionFocusTimes, setSessionFocusTimes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await reauthenticatingFetch("GET", `${baseURL}/api/eye/reading-times/`);

        const { sessionLabels, sessionTotalReadingTimes, sessionFocusTimes } = processData(result);
        setSessionLabels(sessionLabels);
        setSessionTotalReadingTimes(sessionTotalReadingTimes);
        setSessionFocusTimes(sessionFocusTimes);
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: sessionLabels,
    datasets: [
      {
        label: "Focus time (seconds)",
        data: sessionFocusTimes,
        borderWidth: 1,
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        stack: 'combined',
      },
      {
        label: "Total reading time (seconds)",
        data: sessionTotalReadingTimes,
        borderWidth: 1,
        backgroundColor: "rgba(220, 0, 78, 0.2)",
        borderColor: "black",
        stack: 'combined',
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
        text: "Total Reading and Focus Times per Session",
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Time (seconds)",
        },
        beginAtZero: true,
        stacked: true,
      },
      x: {
        title: {
          display: true,
          text: "Session ID",
        },
        stacked: true,
      },
    },
  };

  if (loading)
  {
    return <CircularProgress/>;
  }
  else
  {
    return <Bar data={chartData} options={chartOptions} />;
  }
}