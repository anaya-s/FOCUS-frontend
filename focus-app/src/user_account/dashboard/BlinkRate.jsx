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

import { Box, Typography } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top", 
      display: false,
    },
    title: {
      display: true,
      text: "Blink Rate", 
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: "No. of blinks per minute", // Set your Y-axis label here
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

export default function BlinkRate() {
  const data = {
    labels: [0, 1, 2, 3, 4],
    datasets: [
      {
        label: "Blinks",
        data: [43, 109, 60, 50, 20],
        backgroundColor: "rgba(6, 118, 13, 0.2)",
        borderColor: "rgba(6, 118, 13, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
      <Box>
        <Box sx={{border: "1px solid black", display: "flex", flexDirection: "column", width: "40vw"}}>
          <Typography variant="h4" sx={{textAlign: "center", mt: "2vh"}}>Blink Rate</Typography>
          <Line data={data} options={options} />
        </Box>
      </Box>
  );
}
