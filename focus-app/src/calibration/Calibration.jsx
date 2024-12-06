import React, { useEffect, useState } from "react";
import webgazer from "../webgazer/webgazer";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigation } from "../utils/navigation";

var calibrationData = [];

const CalibrationPage = () => {
  const [clickCounts, setClickCounts] = useState(Array(24).fill(0));
  const [totalClicks, setTotalClicks] = useState(1);

  const [calibrationStatus, setCalibrationLive] = useState(false); // Make sure no more clicks are registered after all circles are filled
  const [skipCalibration, setCalibrationSkip] = useState(false); // Used to skip calibration if already existing
  const [performCalibration, setCalibration] = useState(false); // Used to start new calibration and launch webgazer

  const [isCalibrationGETLoading, setCalibrationGETLoading] = useState(true);
  const [isLoading, setWebgazerLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);


  const [screenInfo, setScreenInfo] = useState({
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  });

  const { toReadingPage } = useNavigation();

  // TO DO:

  // Get screen dimensions
  // Get screen resolution - DONE
  // Send it with calibration data

  // Make webpage go full screen on calibration, then exit fullscreen after
  //  Alert when trying to exit fullscreen - make sure to pause webgazer so nothing is recorded

  // Scroll automatically to top of page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to the top with smooth animation
  }, []);

  // Check if calibration data exists
  useEffect(() => {
      setCalibrationGETLoading(true);
      const getCalibrationDataDB = async () => {
        try {

          const authTokens = localStorage.getItem("authTokens");
          if (!authTokens) {
            console.error("authTokens is not found in localStorage");
            return; // Prevent further execution if tokens are missing
          }

          const parsedTokens = JSON.parse(authTokens); // Parse if not already parsed
          const accessToken = parsedTokens?.access;

          const response = await fetch(`http://localhost:8000/api/user/calibration-retrieval/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
        
          if (!response.ok)
          {
            //if not data found then perform calibration
            setCalibration(true);

            setCalibrationGETLoading(false);
          }
          else
          {
            var responeMsg = await response.json();
            var data = responeMsg.calibration_values;
            localStorage.setItem("calibration", JSON.stringify(data));
            // console.log("Copied from DB to localstorage");

            // Skip calibration
            setCalibrationSkip(true);

            setCalibrationGETLoading(false);
          }
        } catch (error) {
          console.error("Error getting calibration data:", error);
          setCalibrationGETLoading(false);
        }
      };

      // Check localstorage
      if(localStorage.getItem("calibration"))
      {
        calibrationData = JSON.parse(localStorage.getItem("calibration"));
        // console.log("Found calibration data from localstorage: ", calibrationData);
        setCalibrationGETLoading(false);
        setCalibrationSkip(true);
      }
      else // if nothing is found in localstorage, check database
      {
        getCalibrationDataDB(); 
      }
  }, []);


  // WebGazer initialization
  useEffect(() => {
    if(performCalibration == true)
    {
      setWebgazerLoading(true);
    const initializeWebGazer = async () => {
      try {
        
        const loadingInterval = setInterval(() => {
          setLoadingProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(loadingInterval);
            }
            return Math.min(prevProgress + 100, 100);
          });
        }, 250);


        webgazer.params.showVideo = false;
        webgazer.params.showGazeDot = true;
        webgazer.params.showVideoPreview = false;
        webgazer.params.saveDataAcrossSessions = false;
        webgazer.params.showPredictionPoints = false;

        webgazer.clearData();

        await webgazer.begin(true);

        setCalibration(false);
        setCalibrationLive(true);

      } catch (error) {
        console.error("Error initializing WebGazer:", error);
      }
    };

    initializeWebGazer();
    }
  }, [performCalibration]);

  const handleCalibrationClick = (index) => {
    if (calibrationStatus) {
      var reset = false;
      if (totalClicks >= 72) {
        reset = true;
        webgazer.stopCalibration();
        webgazer.end();
        webgazer.params.showGazeDot = false;

        calibrationData = webgazer.getRegressionData();

        // console.log(calibrationData);

        localStorage.setItem("calibration", JSON.stringify(calibrationData));
        setCalibrationLive(false);

        const date = Date.now(); // Get current timestamp when calibration data is sent

        const authTokens = localStorage.getItem("authTokens");
        if (!authTokens) {
          console.error("authTokens is not found in localStorage");
          return; // Prevent further execution if tokens are missing
        }

        const parsedTokens = JSON.parse(authTokens); // Parse if not already parsed
        const accessToken = parsedTokens?.access;

        // Send calibration data to the backend
        fetch(`http://localhost:8000/api/user/calibrate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
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

          setCalibrationSkip(true);
      }

      const newClickCounts = [...clickCounts];
      if (newClickCounts[index] < 3) {
        newClickCounts[index] += 1;
        setClickCounts(newClickCounts);
        setTotalClicks(totalClicks + 1);
      }

      // reset circle colours back to unfilled
      if(reset)
      {
        for (var i = 0; i < 24; i++)
        {
          newClickCounts[i] = 0;
        }
        setClickCounts(newClickCounts);
        reset = false;

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

  const restartCalibration = () => {
    calibrationData = []
    localStorage.removeItem("calibration");
    setTotalClicks(1);
    setCalibrationSkip(false);
    setCalibration(true);
    setLoadingProgress(0);
  };

  const finishCalibration = () => {
    // Move to next webpage
    toReadingPage();
  };

  if (isCalibrationGETLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
          userSelect: "none"
        }}
      >
        <Typography variant="h5" style={{ marginBottom: "20px" }}>
          Checking Calibration Data...
        </Typography>
      </div>
    );
  }

  if (isLoading && performCalibration && !isCalibrationGETLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
          userSelect: "none"
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
  
  if(skipCalibration)
  {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
          userSelect: "none"
        }}
      >
        <Typography variant="h5" style={{ marginBottom: "20px" }}>
          Calibration data ready. Do you want to re-calibrate?
        </Typography>
        <Typography variant="h7" style={{ marginBottom: "15px" }}>
        Please re-calibrate if you've switched location or devices since your last calibration.
        </Typography>
        {/* <Typography variant="h6" style={{ marginBottom: "20px" }}>
          Last calibration date:
        </Typography> */}
        <Button onClick={restartCalibration} variant="outlined" sx={{mb: "20px"}}><span style={{ fontWeight: 'bold' }}>Yes</span></Button>
        <Button onClick={finishCalibration} variant="contained">No,&nbsp;<span style={{ fontWeight: 'bold' }}> continue to text reading</span></Button>
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
        userSelect: "none"
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
          width: "100%",
          height: "500px",
          border: "2px dashed #06760D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: "repeat(3, 1fr)",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: "130px",
          }}
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "3px solid #06760D",
                backgroundColor: getColor(clickCounts[index]),
                cursor: "pointer"
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
