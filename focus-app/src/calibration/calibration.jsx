import React, { useEffect, useState } from "react";
import webgazer from "../webgazer/webgazer";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress"; // Import LinearProgress

const CalibrationPage = () => {
  const [clickCounts, setClickCounts] = useState(Array(15).fill(0)); // Tracks click counts for each circle
  const [totalClicks, setTotalClicks] = useState(1);
  const [isWebGazerInitialized, setIsWebGazerInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // Track progress percentage
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // WebGazer initialization (run it once)
  useEffect(() => {
    const initializeWebGazer = async () => {
      try {
        // Simulate loading progress while initializing WebGazer
        const loadingInterval = setInterval(() => {
          setLoadingProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(loadingInterval);
            }
            return Math.min(prevProgress + 10, 100); // Increment progress until it reaches 100
          });
        }, 500); // Update progress every 500ms

        // Configure WebGazer parameters before initialization
        webgazer.params.showVideo = false;
        webgazer.params.showGazeDot = true;
        webgazer.params.showVideoPreview = false;
        webgazer.params.saveDataAcrossSessions = false;
        webgazer.params.showPredictionPoints = false;

        // Wait for WebGazer initialization
        await webgazer.begin();

        setIsWebGazerInitialized(true); // Mark WebGazer as initialized
        setIsLoading(false); // Stop loading
      } catch (error) {
        console.error("Error initializing WebGazer:", error);
        setIsLoading(false); // Stop loading even if WebGazer fails to initialize
      }
    };

    initializeWebGazer();

    // Cleanup function to stop WebGazer when the component unmounts
    return () => {
      if (isWebGazerInitialized) {
        webgazer.end();
      }
    };
  }, [isWebGazerInitialized]); // Trigger effect on initialization

  const handleCalibrationClick = (index) => {
    if (totalClicks >= 45) {
      webgazer.end();
      webgazer.stopCalibration();
      webgazer.params.showGazeDot = false;
      webgazer.setGazeListener(function (data, elapsedTime) {
        if (data == null) {
          return;
        }
        const xprediction = data.x; // these x coordinates are relative to the viewport
        const yprediction = data.y; // these y coordinates are relative to the viewport
        console.log("X coord:", xprediction);
        console.log("Y coord:", yprediction);
      }).begin();
    }

    const newClickCounts = [...clickCounts];
    if (newClickCounts[index] < 3) {
      console.log("Current button: ", newClickCounts[index]);
      newClickCounts[index] = newClickCounts[index] + 1; // Increments through 0, 1, 2, 3
      console.log("New value ", newClickCounts[index]);
      setClickCounts(newClickCounts);
      setTotalClicks(totalClicks + 1);
      console.log("new total count:", totalClicks);
    }
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

  // Show loading state until WebGazer is initialized
  if (isLoading) {
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
        <Typography variant="h5" style={{ marginBottom: "20px" }}>
          Loading WebGazer...
        </Typography>
        <LinearProgress
          variant="determinate"
          value={loadingProgress}
          style={{ width: "80%", marginTop: "20px" }}
        />
      </div>
    );
  }

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
