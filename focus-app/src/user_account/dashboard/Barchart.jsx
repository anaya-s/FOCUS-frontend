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
  const sessionLabels = data.sessions.map((session) => `Session ${session.session_id}`);
  const sessionTotals = data.sessions.map((session) => session.total_reading_time);
  
  return{sessionLabels, sessionTotals};
}

export default function Barchart() {
  const [loading, setLoading] = useState(true);
  const [sessionLabels, setSessionLabels] = useState([]);
  const [sessionTotals, setSessionTotals] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        //const result = await reauthenticatingFetch('/eye/reading-times/');
        const result = {
          "sessions": [
              {
                  "session_id": 1,
                  "total_reading_time": "95",
                  "videos": [
                      {"video_id": 1, "total_reading_time": "0:45:30"},
                      {"video_id": 2, "total_reading_time": "0:45:15"}
                  ]
              },
              {
                  "session_id": 2,
                  "total_reading_time": "1023",
                  "videos": [
                      {"video_id": 3, "total_reading_time": "1:15:00"},
                      {"video_id": 4, "total_reading_time": "1:00:10"}
                  ]
              }
          ]
      }
      const { sessionLabels, sessionTotals } = processData(result);
      setSessionLabels(sessionLabels);
      setSessionTotals(sessionTotals);
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
        label: "Reading Times/min",
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
      },
      title: {
        display: true,
        text: "Reading Times", 
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
}
