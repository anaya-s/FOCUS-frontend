import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import webgazer from "../webgazer/webgazer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import DoneIcon from '@mui/icons-material/Done';
import Swal from 'sweetalert2';

import { useNavigation } from "../utils/navigation";
import { reauthenticatingFetch } from "../utils/api";
import config from '../config'
const baseURL = config.apiUrl
import { calcAccuracy } from "./accuracy.js";

var calibrationData = [];

const CalibrationPage = () => {
  const [clickCounts, setClickCounts] = useState(Array(24).fill(0));
  const [totalClicks, setTotalClicks] = useState(1);

  const [calibrationStatus, setCalibrationLive] = useState(false); // Make sure no more clicks are registered after all circles are filled
  const [skipCalibration, setCalibrationSkip] = useState(false); // Used to skip calibration if already existing
  const [performCalibration, setCalibration] = useState(false); // Used to start new calibration and launch webgazer

  const [isCalibrationGETLoading, setCalibrationGETLoading] = useState(true);
  const [isLoading, setWebgazerLoading] = useState(true);

  const [accuracy, setAccuracy] = useState(0);
  const [calibrationTimestamp, setCalibrationTimestamp] = useState(formatTimestamp(new Date(Date.now())));

  const location = useLocation();
  const { file, parsedText } = location.state || {};

  const [screenInfo, setScreenInfo] = useState({
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  });

  const { toReadingPage } = useNavigation();

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  // TO DO:

  // Get screen dimensions
  // Get screen resolution - DONE
  // Send it with calibration data

  /* Change gap between calibration points if window size changes */
  useEffect(() => {
    const handleResize = () => {
      // update the gaps on resize
      setGap(window.innerWidth / 11);
      setRowGap(window.innerWidth / 6);
    };

    window.addEventListener("resize", handleResize);
    return () => 
    {
      Swal.close();
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
      window.removeEventListener('click', closeAlertOnClick);
      window.removeEventListener('fullscreenchange', onFullscreenChange);
    }
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-swal-container {
        z-index: 1500; /* Set the desired z-index */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const onFullscreenChange = useCallback((event) => {
    if (!document.fullscreenElement) {

        webgazer.end();

        document.getElementById("calibrationGrid").style.display = "none";

        Swal.fire({
          title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Fullscreen Mode Required</span>',
          html: `
          <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none">
            <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; height: auto">
            <div style="margin-left: 20px; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
              <p>Please stay in fullscreen mode during calibration to ensure accurate eye tracking.</p>
            </div>
          </div>
        `,
          icon: 'warning',
          iconColor: 'orange',
          width: '40vw',
          confirmButtonColor: "#06760D",
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: '<span style="user-select: none; padding: 0">Return to Full Screen</span>',
          customClass: {
            container: 'custom-swal-container', // Apply the custom class
          },
          willClose: async () => {
            try
            {
            await webgazer.begin(true);
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            }
            document.getElementById("calibrationGrid").style.display = "grid";
            } catch (error) {
              // Reset calibration if camera is disabled midway through calibration
              webgazer.clearData();
              
              const newClickCounts = [...clickCounts];
              for (var i = 0; i < 24; i++)
              {
                newClickCounts[i] = 0;
              }
              setClickCounts(newClickCounts);

              calibrationData = []
              localStorage.removeItem("calibration");
              localStorage.removeItem("accuracy");
              setTotalClicks(1);
              setCalibrationSkip(false);
              setCalibration(true);
              setCalibrationLive(false);
            }
          }
        });
    }
},[]);

  function closeAlertOnClick() {
    Swal.close();
    document.getElementById("calibrationGrid").style.display = "grid";
    document.removeEventListener('click', closeAlertOnClick);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
}

  useEffect(() => {
    if(!skipCalibration & calibrationStatus)
    {
      document.addEventListener('click', closeAlertOnClick);

      document.getElementById("calibrationGrid").style.display = "none";

      Swal.fire({
        title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: #06760D; user-select: none">Performing Calibration</span>',
        html: `
        <p style="font-family: Arial, sans-serif; font-size: 18px; color: black; user-select: none">Click on each circle while looking at it until <span style="color: green; font-weight: bold;">filled</span></p>
        <img src="../../public/images/calibration/calibrationPoints.png" alt="Felix" style="width: 35vw">
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none">
          <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; height: auto; margin-top: 50px">
          <div style="margin-left: 20px; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
            <p>Please ensure you are in a well-lit environment and there is no glare from light sources.</p>
            <p style="margin-top: 20px;">Aim to position the <span style="color: red;">gaze dot</span> inside each circle with small mouse movements before clicking.</p>
          </div>
        </div>
      `,
        width: '40vw',
        confirmButtonColor: "#06760D",
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: '<span style="user-select: none; padding: 0">Start</span>',
        customClass: {
          container: 'custom-swal-container', // Apply the custom class
        },
      });


    }
  }, [skipCalibration, calibrationStatus]);

  useEffect(() => {

    window.scrollTo({ top: 0 }); // auto-scroll to the top

    // Disable scrolling
    document.body.style.overflow = 'hidden';

    // Cleanup to restore scrolling on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [performCalibration, isCalibrationGETLoading, skipCalibration]);

  const [gap, setGap] = useState(window.innerWidth / 11);
  const [rowGap, setRowGap] = useState(window.innerWidth / 6);

  // Check if calibration data exists
  useEffect(() => {
      setCalibrationGETLoading(true);
      const getCalibrationDataDB = async () => {
        try {

          const responseMsg = await reauthenticatingFetch("GET",`${baseURL}/api/user/calibration-retrieval/`)
        
          if (responseMsg.error) // if the JSON response contains an error, this means that no calibration data is found in database
          {
            // perform calibration
            setCalibration(true);

            setCalibrationGETLoading(false);
          }
          else
          {
            var data = responseMsg.calibration_values;
            setAccuracy(responseMsg.accuracy);
            setCalibrationTimestamp(formatTimestamp(responseMsg.created_at));
            try
            {
              localStorage.setItem("calibration", JSON.stringify(data)); // store local copy of calibration data in localstorage, so no need to fetch from database in same session
              localStorage.setItem("accuracy",JSON.stringify(responseMsg.accuracy)); // also store accuracy of current calibration data for reference
              localStorage.setItem("timestamp", JSON.stringify(responseMsg.created_at));
              // console.log("Copied from DB to localstorage");
            }
            catch (error) 
            {
              console.error("Failed to save calibration data to localStorage:", error);
              localStorage.removeItem("calibration");
              localStorage.removeItem("accuracy");
              console.log("Applying the calibration data directly to the WebGazer instance");
              webgazer.setRegressionData(data);
            }

            // skip calibration
            setCalibrationSkip(true);

            setCalibrationGETLoading(false);
          }
        } catch (error) {
          console.error("Error getting calibration data:", error);
          setCalibrationGETLoading(false);
        }
      };

      // Check localstorage
      if(localStorage.getItem("calibration") && localStorage.getItem("accuracy"))
      {
        calibrationData = JSON.parse(localStorage.getItem("calibration"));
        const accuracyValue = JSON.parse(localStorage.getItem("accuracy"));
        const timestamp = JSON.parse(localStorage.getItem("timestamp"));
        // console.log("Found calibration data from localstorage: ", calibrationData);
        setAccuracy(accuracyValue);
        setCalibrationTimestamp(formatTimestamp(timestamp));

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

        webgazer.params.showVideo = false;
        webgazer.params.showGazeDot = true; // set false to remove gaze dot
        webgazer.params.showVideoPreview = false;
        webgazer.params.saveDataAcrossSessions = false;
        webgazer.params.showPredictionPoints = false;
        webgazer.setRegression("weightedRidge");

        // change moveTickSize, videoViewerWidth and videoViewerHeight for accuracy
        webgazer.params.videoViewerWidth = 1920;
        webgazer.params.videoViewerHeight = 1080;
        webgazer.params.moveTickSize = 25;

        webgazer.clearData();

        await webgazer.begin(true);

        setCalibration(false);
        setCalibrationLive(true);
        setCalibrationSkip(false);

        document.addEventListener('fullscreenchange', onFullscreenChange);

      } catch (error) {
        console.error("Error initializing WebGazer:", error);
        document.getElementById("webgazerLoading").style.visibility  = "hidden";
        Swal.fire({
          title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Failed to start Webgazer</span>',
          html: `
          <p style="font-family: Arial, sans-serif; font-size: 18px; color: black; user-select: none">Webcam not detected or disabled</p>
          <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none, margin-top: 2vh">
            <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; height: auto; user-select: none">
            <div style="margin-left: 2vh; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
              <p>Please check if your webcam is <span style="font-weight: bold">enabled and connected</span>. A webcam is required for this website.</p>
              <p style="margin-top: 2vh;">If your webcam is enabled and connected, please check and allow your <span style="font-weight: bold">browser's camera permissions</span>.</p>
            </div>
          </div>
        `,
          icon: 'warning',
          iconColor: 'orange',
          width: '40vw',
          confirmButtonColor: "#06760D",
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: '<span style="user-select: none; padding: 0">Restart Webgazer</span>',
          customClass: {
            container: 'custom-swal-container', // Apply the custom class
          },
          willClose: async () => {
            document.getElementById("webgazerLoading").style.visibility  = "visible";
            initializeWebGazer();
          }
        });
      }
    };

    initializeWebGazer();
    }
  }, [performCalibration]);

  const handleCalibrationClick = async(index) => {
    if (calibrationStatus) {
      var reset = false;

      const newClickCounts = [...clickCounts];
      if (newClickCounts[index] < 3) {
        newClickCounts[index] += 1;
        setClickCounts(newClickCounts);
        setTotalClicks(totalClicks + 1);
      }

      if (totalClicks >= 72) {

        document.removeEventListener('fullscreenchange', onFullscreenChange);

        reset = true;
        webgazer.stopCalibration();

        // turn off calibration grid points
        const calibrationGrid = document.getElementById("calibrationGrid");
        calibrationGrid.style.display = "none";

        // turn on countdown number at centre of screen
        const countdownDiv = document.getElementById("countdown");
        countdownDiv.style.display = "block";

        // obtain calibration area box
        const calibrationArea = document.getElementById("calibrationArea");
        const calibrationArea_rect = calibrationArea.getBoundingClientRect();

        setCalibrationLive(false);

        const accuracyValue = await calcAccuracy(calibrationArea_rect, countdownDiv); // calculate accuracy of calibration

        setAccuracy(accuracyValue);

        webgazer.end();
        webgazer.params.showGazeDot = false;

        calibrationData = webgazer.getRegressionData();

        const date = Date.now(); // Get current timestamp when calibration data is sent

        setCalibrationTimestamp(formatTimestamp(date));

        try {
        localStorage.setItem("calibration", JSON.stringify(calibrationData));
        localStorage.setItem("accuracy",JSON.stringify(accuracyValue)); // also store accuracy of current calibration data for reference
        localStorage.setItem("timestamp", JSON.stringify(date));
        } catch(error)
        {
          console.error("Failed to save calibration data to localStorage:", error);
          localStorage.removeItem("calibration");
          localStorage.removeItem("accuracy");
        }

        const bodyContents = { data: calibrationData,  timestamp: date, accuracy: accuracyValue };
        console.log(bodyContents);

        // Send calibration data to the backend
        const response = await reauthenticatingFetch("POST", `${baseURL}/api/user/calibrate/`, bodyContents)

        if(response.error)
          console.log(response.error);
        else
          console.log(response.message);

        setCalibrationSkip(true);
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
        return "white";
    }
  };

  const addTick = (clickCount) => {
    if (clickCount === 3) {
      return <DoneIcon sx={{color: "white"}}/>;
    }
  };

  const restartCalibration = () => {
    calibrationData = []
    localStorage.removeItem("calibration");
    localStorage.removeItem("accuracy");
    setTotalClicks(1);
    setCalibrationSkip(false);
    setCalibration(true);
  };

  const finishCalibration = () => {
    // Move to next webpage
    toReadingPage(file, parsedText);
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
        id="webgazerLoading"
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
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          Calibration data ready.
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" style={{ marginBottom: "20px", marginRight: "20px"}}>
            Last calibration date:  <span style={{ fontWeight: 'bold' }}>{calibrationTimestamp}</span>
          </Typography>
          <Typography variant="h6" style={{ marginBottom: "20px" }}>
            Accuracy: <span style={{ fontWeight: 'bold', color: accuracy < 50 ? 'red' : (accuracy >= 75 ? 'green' : 'orange') }}>{accuracy}%</span>
          </Typography>
        </Box>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
        Do you want to re-calibrate?
        </Typography>
        <Typography variant="h7" style={{ marginBottom: "20px" }}>
            {accuracy >= 75 ? (
                <>Please re-calibrate if you've <span style={{ fontWeight: 'bold' }}>switched location or devices</span> since your last calibration</>
            ) : (
                <>We recommend you to <span style={{ fontWeight: 'bold' }}>improve the accuracy</span> of your calibration</>
            )}
        </Typography>
        <Button onClick={restartCalibration} variant="outlined" sx={{mb: "20px"}}><span style={{ fontWeight: 'bold' }}>Yes</span></Button>
        <Button onClick={finishCalibration} variant="contained">No,&nbsp;<span style={{ fontWeight: 'bold' }}> continue to text reading</span></Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        userSelect: "none",
        marginTop: "15vh"
      }}
    >
      <div
        id = "calibrationArea"
        style={{
          width: "92vw",
          height: "85vh",
          minWidth: "92vw",
          minHeight: "85vh",
          border: "2px dashed #06760D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
          boxSizing: "border-box",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography id="countdown" variant="h3" sx={{display: "none"}}>5</Typography>
        <div
          id = "calibrationGrid"
          style={{
            display: "grid",
            gridTemplateRows: "repeat(3, 1fr)",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: gap + "px",
            rowGap: rowGap + "px",
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
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => handleCalibrationClick(index)}
            >
              {addTick(clickCounts[index])}
            </div>
          ))}
        </div>
      </div>
      <Box sx={{ ml: "1.5vw", backgroundColor: "#f9f9f9", background: 'repeating-linear-gradient(45deg, white, white 10px, #06760D 10px, #06760D 13px)', border: "2px dashed #06760D", height: "85vh", width: "8vw"}}></Box>
    </div>
  );
};

export default CalibrationPage;
