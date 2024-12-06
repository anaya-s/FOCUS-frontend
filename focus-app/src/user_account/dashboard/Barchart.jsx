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
  
}
export default function Barchart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        //const result = await reauthenticatingFetch('/api/eye/reading-times/');
        const result = {
          "sessions": [
              {
                  "session_id": 1,
                  "total_reading_time": "1:30:45",
                  "videos": [
                      {"video_id": 1, "total_reading_time": "0:45:30"},
                      {"video_id": 2, "total_reading_time": "0:45:15"}
                  ]
              },
              {
                  "session_id": 2,
                  "total_reading_time": "2:15:10",
                  "videos": [
                      {"video_id": 3, "total_reading_time": "1:15:00"},
                      {"video_id": 4, "total_reading_time": "1:00:10"}
                  ]
              }
          ]
      }
        setData(result);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Monthly Sales",
        data: [65, 59, 80, 81, 56],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
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
        text: "Monthly Sales Data", 
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
}
