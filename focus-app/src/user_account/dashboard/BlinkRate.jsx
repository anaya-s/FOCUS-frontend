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
        display: false,
        text: "Month",
      },
      beginAtZero: false, // Optional: Ensures the Y-axis starts at zero
    },
  },
};

export default function BlinkRate() {
  const data = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Blinks",
        data: [120, 109, 30, 50, 20],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
}
