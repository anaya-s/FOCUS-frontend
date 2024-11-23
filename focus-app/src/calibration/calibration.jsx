import React, { useEffect, useState } from "react";
import webgazer from "webgazer";
import Typography from "@mui/material/Typography";

const CalibrationPage = () => {
  const [clickCounts, setClickCounts] = useState(Array(15).fill(0)); // Tracks click counts for each circle

  useEffect(() => {
    // Initialize WebGazer and hide video and prediction points
    webgazer
      .setGazeListener((data, timestamp) => {
        if (data == null) return;
      })
      .showVideo(false) // Disable live video feed
      .showPredictionPoints(false) // Disable prediction dots
      .begin();

    return () => {
      // Stop WebGazer when component unmounts
      webgazer.end();
    };
  }, []);

  const handleCalibrationClick = (index) => {
    // Update the click count for the clicked circle
    const newClickCounts = [...clickCounts];
    newClickCounts[index] = (newClickCounts[index] + 1) % 4; // Cycles through 0, 1, 2, 3
    setClickCounts(newClickCounts);

    // Simulate recording calibration data (optional)
    webgazer.recordScreenPosition();
  };

  const getColor = (clickCount) => {
    switch (clickCount) {
      case 1:
        return "#B3D9B5"; // First click
      case 2:
        return "#66B266"; // Second click
      case 3:
        return "#06760D"; // Third click
      default:
        return "transparent"; // Initial state
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px", // Space between header and calibration grid
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          Calibration:
        </Typography>
        <Typography variant="h7">
          To calibrate the eye tracker, please click each circle, while looking
          at it, until filled.
        </Typography>
      </div>

      {/* Calibration Grid Section */}
      <div
        style={{
          width: "60%",
          height: "60%",
          border: "2px dashed #06760D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px", // Ensure there's space inside the border
          boxSizing: "border-box", // Include border in the size calculation
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: "repeat(3, 1fr)",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "90px",
          }}
        >
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "3px solid #06760D",
                backgroundColor: getColor(clickCounts[index]), // Determine fill color
                cursor: "pointer",
              }}
              onClick={() => handleCalibrationClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalibrationPage;
