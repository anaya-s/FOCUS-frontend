import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { reauthenticatingFetch } from '../../utils/api';

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
  const sessionTotals = data.sessions.map((session) => session.total_reading_time);
  
  return{sessionLabels, sessionTotals};
}

export default function ReadingTime() {
  const [loading, setLoading] = useState(true);
  const [sessionLabels, setSessionLabels] = useState([]);
  const [sessionTotals, setSessionTotals] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const result = await reauthenticatingFetch('/eye/reading-times/');

      /* ---------------------Temporary for authentication ------------------------- */
        
      const authTokens = localStorage.getItem("authTokens");
      if (!authTokens) {
        console.error("authTokens is not found in localStorage");
        return; // Prevent further execution if tokens are missing
      }

      const parsedTokens = JSON.parse(authTokens); // Parse if not already parsed
      const accessToken = parsedTokens?.access;

      const response = await fetch(`http://localhost:8000/api/eye/reading-times/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      const { sessionLabels, sessionTotals } = processData(result);
      setSessionLabels(sessionLabels);
      setSessionTotals(sessionTotals);
      setLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    /* -----------------------------------------------------------------------------------*/

    fetchData();
  }, []);

  const chartData = {
    labels: sessionLabels,
    datasets: [
      {
        label: "Reading time (seconds)",
        data: sessionTotals,
        borderWidth: 1,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
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
        display: true,
        text: "Reading Times", 
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Time (seconds)", // Set your Y-axis label here
        },
        beginAtZero: true, // Optional: Ensures the Y-axis starts at zero
      },
      x: {
        title: {
          display: true,
          text: "Session ID",
        },
        beginAtZero: false, // Optional: Ensures the Y-axis starts at zero
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
}
