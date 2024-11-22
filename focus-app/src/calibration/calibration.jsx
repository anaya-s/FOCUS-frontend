import React, { useEffect, useState } from "react";
import webgazer from "webgazer";

const CalibrationPage = () => {
  const [calibratedPoints, setCalibratedPoints] = useState(Array(15).fill(false)); // Tracks if a circle is calibrated

  useEffect(() => {
    // Initialize WebGazer
    webgazer.setGazeListener((data, timestamp) => {
      if (data == null) return;
    })
    .showVideo(false) 
    .showPredictionPoints(false)
    .begin();

    return () => {
      // Stop WebGazer when component unmounts
      webgazer.end();
    };
  }, []);

  const handleCalibrationClick = (index) => {
    // Update the calibration status for the clicked point
    const newCalibratedPoints = [...calibratedPoints];
    newCalibratedPoints[index] = true;
    setCalibratedPoints(newCalibratedPoints);

    // Simulate recording calibration data (optional)
    webgazer.recordScreenPosition();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "60%",
          height: "50%",
          border: "2px dashed #06760D",
          display: "grid",
          gridTemplateRows: "repeat(3, 1fr)",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
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
              backgroundColor: calibratedPoints[index] ? "#06760D" : "transparent",
              cursor: "pointer",
            }}
            onClick={() => handleCalibrationClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CalibrationPage;
