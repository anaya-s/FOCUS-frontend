import React, { useEffect, useState, useRef } from "react";
import webgazer from "../webgazer/webgazer";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

const CalibrationPage = () => {
  const [clickCounts, setClickCounts] = useState(Array(15).fill(0));
  const [totalClicks, setTotalClicks] = useState(1);
  const [isWebGazerInitialized, setIsWebGazerInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [calibrationStatus, isCalibrationLive] = useState(true);
  const socket = useRef(null);

  let calibrationData = [];
  let websocket; // Define WebSocket variable

  // Scroll automatically to top of page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to the top with smooth animation
  }, []);

  // WebGazer initialization
  useEffect(() => {
    const initializeWebGazer = async () => {
      try {
        const loadingInterval = setInterval(() => {
          setLoadingProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(loadingInterval);
            }
            return Math.min(prevProgress + 10, 100);
          });
        }, 250);

        webgazer.params.showVideo = false;
        webgazer.params.showGazeDot = true;
        webgazer.params.showVideoPreview = false;
        webgazer.params.saveDataAcrossSessions = false;
        webgazer.params.showPredictionPoints = false;

        await webgazer.begin();

        setIsWebGazerInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing WebGazer:", error);
        setIsLoading(false);
      }
    };

    initializeWebGazer();

    return () => {
      if (isWebGazerInitialized) {
        webgazer.end();
      }
    };
  }, [isWebGazerInitialized]);

  const handleCalibrationClick = (index) => {
    if (calibrationStatus) {
      if (totalClicks >= 45) {
        webgazer.end();
        webgazer.params.showGazeDot = false;
        calibrationData = webgazer.getRegressionData();

        isCalibrationLive(false);

        const date = Date.now(); // Get current timestamp of current frame

        const token = localStorage.getItem("authTokens");

        console.log(token);

        // Send calibration data to the backend
        fetch(`http://localhost:8000/api/user/calibrate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authTokens")}`,
          },
          body: JSON.stringify({ data: calibrationData,  timestamp: date}),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Calibration data sent successfully:", data);
          })
          .catch((error) => {
            console.error("Error sending calibration data:", error);
          });

      }

      const newClickCounts = [...clickCounts];
      if (newClickCounts[index] < 3) {
        newClickCounts[index] += 1;
        setClickCounts(newClickCounts);
        setTotalClicks(totalClicks + 1);
      }
    }
  };

  const getColor = (clickCount) => {
    switch (clickCount) {
      case 1:
        return "#B3D9B5";
      case 2:
        return "#66B266";
      case 3:
        return "#06760D";
      default:
        return "transparent";
    }
  };

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
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
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

      <div
        style={{
          width: "60%",
          height: "60%",
          border: "2px dashed #06760D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          boxSizing: "border-box",
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
                backgroundColor: getColor(clickCounts[index]),
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
