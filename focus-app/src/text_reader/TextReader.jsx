import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "../utils/navigation";
import { useLocation } from 'react-router-dom';

import { reauthenticatingFetch } from "../utils/api";
import config from '../config'
const baseURL = config.apiUrl
import '../../public/fonts/fonts.css'

import webgazer from "../webgazer/webgazer.js";

import NormalReading from "./NormalReading";
import { sendReadingProgress, SpeedReading } from "./SpeedReading";
import { sendReadingProgressRSVP, RSVP } from "./RSVP";
import { sendReadingProgressLineUnblur, LineUnblur } from "./LineUnblur";
import { NLP } from "./NLP";

/* MaterialUI Imports */
import { Button, Typography, Container, Box, LinearProgress, IconButton, Tooltip, Divider, Drawer, Slider, Select, MenuItem, FormControl, ListSubheader, Grid2, TextField, Checkbox, Alert, Collapse, CircularProgress } from "@mui/material";

import {
  Menu as MenuIcon,
  ExitToAppRounded as ExitToAppRoundedIcon,
  FormatSizeRounded as FormatSizeRoundedIcon,
  Opacity as OpacityIcon,
  Brightness6Rounded as Brightness6RoundedIcon,
  FormatLineSpacingRounded as FormatLineSpacingRoundedIcon,
  Subject as SubjectIcon,
  SpeedRounded as SpeedRoundedIcon,
  SkipPreviousRounded as SkipPreviousRoundedIcon,
  PlayArrowRounded as PlayArrowRoundedIcon,
  PauseRounded as PauseRoundedIcon,
  ArticleTwoTone as ArticleTwoToneIcon,
  ZoomInRounded as ZoomInRoundedIcon,
  TextIncrease as TextIncreaseIcon,
  DeblurRounded as DeblurRoundedIcon,
  ReplayRounded as ReplayRoundedIcon,
  FaceRetouchingOffRounded as FaceRetouchingOffRoundedIcon,
} from '@mui/icons-material';

import { styled } from '@mui/system';

import Swal from "sweetalert2";

const FlashingButton = styled(Button)(({ theme }) => ({
  animation: 'flash 1s infinite',
  '@keyframes flash': {
    '0%': {
      backgroundColor: "transparent",
    },
    '50%': {
      backgroundColor: "#FF8C00", // Dark Orange
      color: "black"
    },
    '100%': {
      backgroundColor: "transparent",
    },
  },
}));

function TextReaderPage() { 
  // const videoRef = useRef(null);
  const socket = useRef(null);
  // const [stream, setStream] = useState(null);
  // const [streamObtained, setStreamStatus] = useState(false);
  const [connectionOpen, setStatusConn] = useState(false);
  const [framesData, setFramesData] = useState([]);
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setWebgazerLoading] = useState(false);
  const [webgazerFinished, setWebgazerFinished] = useState(false);

  /*
  Status of WebSocket connection (used for retrying connection and for showing alerts):
  -1 - Successful connection (message cleared)
  0 - Successful connection message
  1 - Connecting message
  2 - Lost connection message
  */
  const [retryConnection, setRetryConnection] = useState(1);

  const location = useLocation();
  const { file, parsedText } = location.state || {};
  const fileRef = useRef(null);
  const fileNameRef = useRef(null);
  const parsedTextRef = useRef(null);

  /* Reading mode index
    1 - Normal reading
    2 - RSVP
    3 - Speed reading (word highlighting)
    4 - Line by line unblurring
    5 - Natural Language Processing (NLP) assistance
  */
  const readingMode = useRef(3);
  const [mode, setMode] = useState(3);

  /* Hide reading modes based on input document type:
  0 - hide nothing
  1 - hide Reading Mode 1
  2 - hide Reading Modes 2,3,4,5
  */
  const [hideSettings, setHideSettings] = useState(0);

  /* Set a timer for 5 minutes, checking if user is focused or not */
  const [focusTimer, setFocusTimer] = useState(0);
  const [startTimer, setStartTimer] = useState(false);

  const currentBreakTime = useRef(0);
  const totalBreakTime = useRef(0);

  const isOnBreak = useRef(false);
  const [isNoFaceDetected, setNoFaceDetected] = useState(true); // used for "No face detected" alert

  // Set this value using the Settings page - maybe stored from localStorage
  const [timeLimit, setTimeLimit] = useState(1); // 1 minute time limit by default

  function secondsToHms(seconds) 
  {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  const getBreakAlertContent = () => {
    return `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none">
        <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; height: auto">
        <div style="margin-left: 20px; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
          <p>It looks like you've lost focus in the past five minutes. How about taking a short break?</p>
          <p style="margin-top: 20px;"><span style="font-weight: bold">Current break time:</span> ${secondsToHms(currentBreakTime.current)}</p>
          <p style="margin-top: 20px;"><span style="font-weight: bold">Total break time:</span> ${secondsToHms(totalBreakTime.current)}</p>
          <p style="margin-top: 20px;">Press <span style="font-weight: bold">Continue</span> to resume reading.</p>
        </div>
      </div>
    `;
  };

  useEffect(() => {

    let incrementTimer;
    let incrementBreakTimer;

    const getBreakStatus = async () => {
      try
      {
        const response = await reauthenticatingFetch("GET", `${baseURL}/api/eye/break-check/?time_limit=${timeLimit}`);
        //console.log(response);

        if(response.status)
        {
          console.error("Not enough data to check break status: ", response.status);
          setStartTimer(true);
        }
        else
        {
          if(response.face_detected_status == true && response.focus_status == true)
          {
            setStartTimer(true);
            setNoFaceDetected(true);
          }

          if(response.face_detected_status == false)
          {
            // Show small alert notifying users to keep face in view
            setNoFaceDetected(false);
          }
          if(response.focus_status == false)
          {
            isOnBreak.current = true;
            showBreakAlert();
          }
        }
      }
      catch(error)
      {
        console.error("Failed to check break status:", error);
        setStartTimer(true);
      }

    };

    if(retryConnection <= 0)
    {
      if (startTimer == true) {
        clearInterval(incrementBreakTimer);

        incrementTimer = setInterval(() => {
          setFocusTimer(prevTimer => prevTimer + 1);
        }, 1000); // Increment timer every second

        if(focusTimer >= (timeLimit * 60))
        {
          // console.log("Checking focus and face detection in past {timeLimit} minutes ...");
          setStartTimer(false);
          setFocusTimer(0);
          clearInterval(incrementTimer);
          getBreakStatus();
        }

        // console.log("timer : ", focusTimer);
      }
      else
      {
        incrementBreakTimer = setInterval(() => {
          currentBreakTime.current += 1;
          totalBreakTime.current += 1;

          Swal.update({
            html: getBreakAlertContent()
          });
        }, 1000); // Increment timer and update alert contents every second
      }
    }
    else
      setFocusTimer(0);

    return () => {
      clearInterval(incrementTimer);
      clearInterval(incrementBreakTimer);
    };
  }, [focusTimer, startTimer, retryConnection]);

  /* Check if file is uploaded correctly with its parsed text */
  useEffect(() => {
    if(file !== undefined && parsedText !== undefined)
    {
      setWebgazerLoading(true);

      fileRef.current = file;
      fileNameRef.current = file.name;
      parsedTextRef.current = parsedText;

      maxWordCountRef.current = findMaxWordsinLine(parsedTextRef.current);

      if (parsedText.length === 0) // Image-based PDF file
      {
        readingMode.current = 1;
        setMode(1);
        setHideSettings(1);
      }
      else
      {
        if(file.type !== "application/pdf") // Word or text file
        {
          readingMode.current = 3;
          setMode(3);
          setHideSettings(2);
        }
      }
    }
    else
      toDrive(1); // Return back to Drive page with error status

    return () => {
      Swal.close();
    };
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

  const showBreakAlert = () => {

    Swal.fire({

      title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Break suggested</span>',
        html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none">
          <img src="../../public/images/homepage/felix_done.png" alt="Felix" style="width: 150px; height: auto">
          <div style="margin-left: 20px; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
            <p>I have detected fatigue. Please take a break.</p>
            <p style="margin-top: 20px;">Total break time: </p>
            <p style="margin-top: 20px;">Press continue to resume reading.</p>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Continue", // maybe also add "Return to drive" button
      confirmButtonColor: "#06760D",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCancelButton: false,
      showDenyButton: false,
      showConfirmButton: true,
      showCloseButton: false,
      customClass: {
        container: 'custom-swal-container', // Apply the custom class
      },
      willClose: async () => {
        setStartTimer(true);
        isOnBreak.current = false;
        currentBreakTime.current = 0;
      }
    });

  };
  
  const fpsIntervalRef = useRef(60);

  /* Text typography parameters */

  const fontOptions = [
    { label: "Sans-Serif Fonts", type: "header" },
    { label: "Istok Web", value: "Istok Web, sans-serif" },
    { label: "OpenDyslexic", value: "'OpenDyslexic', sans-serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Roboto", value: "Roboto, sans-serif" },
    { label: "Open Sans", value: "Open Sans, sans-serif" }, 
    
    { label: "Serif Fonts", type: "header" },
    { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Merriweather", value: "Merriweather, serif" }, 
  ];

  /* Text settings sliders that use refs for storing and updating values across components */
  const fontStyleRef = useRef(fontOptions[1].value);
  const fontSizeRef = useRef(28);
  const textOpacityRef = useRef(0.5);
  const letterSpacingRef = useRef(0);
  const lineSpacingRef = useRef(3);
  const backgroundBrightnessRef = useRef(0);
  const invertTextColourRef = useRef(false);
  const backgroundColourRef = useRef([0, 0, 0]);
  const backgroundColourSelectionRef = useRef(1);

  /* States for text settings sliders */
  const [fontStyle, setFontStyle] = useState(fontOptions[1].value);
  const [fontSize, setFontSize] = useState(28);
  const [textOpacity, setTextOpacity] = useState(0.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineSpacing, setLineSpacing] = useState(3);
  const [backgroundBrightness, setBackgroundBrightness] = useState(0);
  const [backgroundColour, setBackgroundColour] = useState([0, 0, 0]);

  /* Sliders for Reading Mode 1 */
  const pdfScaleRef = useRef(1);
  const pdfCurrentPageRef = useRef(1);
  const pdfTotalPagesRef = useRef(1);
  const pdfSetPageRef = useRef(false);
  const isPDFRef = useRef(false);

  /* States for Reading Mode 1 sliders */
  const [pdfScale, setPdfScale] = useState(1);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfSetPage, setPdfSetPage] = useState(false);

  /* Functions to handle change of slider values */
  const colourSchemeSelection = (selection) => ({
    border: backgroundColourSelectionRef.current == selection ? "3px solid #06760D" : "normal"
  });
  
  const colourSchemeButton = (colour) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "5px",
    border: "1px solid #ccc",
    pt: "5px", pb: "5px",
    width: "2vw",
    backgroundColor: readingMode.current !== 1 ? invertTextColourRef.current ? colour : "white" : colour
  });

  const colourSchemeIconColour = (colour) => ({
    fontSize: "30px", color: invertTextColourRef.current ? "white" : colour
  });

  const handleFontStyle = async(event) => {
    fontStyleRef.current = event.target.value;
    setFontStyle(event.target.value);
  };

  const handleFontSize = async(event) => {
    fontSizeRef.current = event.target.value;
    setFontSize(event.target.value);
  };

  const handleTextOpacity = async(event) => {
    textOpacityRef.current = event.target.value;
    setTextOpacity(event.target.value);
  };

  const handleBackgroundBrightness = async(event) => {
    backgroundBrightnessRef.current = event.target.value;
    if(event.target.value > 0.5)
      invertTextColourRef.current = true;
    else
      invertTextColourRef.current = false;
    setBackgroundBrightness(event.target.value);
  };

  const handleLetterSpacing = async(event) => {
    letterSpacingRef.current = event.target.value;
    setLetterSpacing(event.target.value);
  };

  const handleLineSpacing = async(event) => {
    lineSpacingRef.current = event.target.value;
    setLineSpacing(event.target.value);
  };

  const handlePdfScale = async(event) => {
    pdfScaleRef.current = event.target.value;
    setPdfScale(event.target.value);
  };

  const handlePdfPageChange = async(event) => {
    pdfCurrentPageRef.current = event.target.value;
    setPdfCurrentPage(event.target.value);
    pdfSetPageRef.current = true;
    setPdfSetPage(true);
  };

  const setDefaultSettings = () => {
    fontStyleRef.current = fontOptions[1].value;
    setFontStyle(fontOptions[1].value);

    fontSizeRef.current = 28;
    setFontSize(28);

    textOpacityRef.current = 0.5;
    setTextOpacity(0.5);

    letterSpacingRef.current = 0;
    setLetterSpacing(0);

    if(readingMode.current === 4)
    {
      lineSpacingRef.current = 7;
      setLineSpacing(7);
    }
    else
    {
      lineSpacingRef.current = 3;
      setLineSpacing(3);
    }

    backgroundBrightnessRef.current = 0;
    setBackgroundBrightness(0);

    invertTextColourRef.current = false;
    
    backgroundColourRef.current = [0,0,0];
    setBackgroundColour([0,0,0]);

    backgroundColourSelectionRef.current = 1;

    if(readingMode.current === 2)
    {
      highlightSpeedRef.current = 5;
      setHighlightSpeed(5);
    }
    else
    {
      highlightSpeedRef.current = 2;
      setHighlightSpeed(2);
    }

    wordCountRef.current = 1;
    setWordCount(1);
    
    setPrevLineUnblur(false);
    prevLineUnblurRef.current = false;
    setAutoScroll(true);
    autoScrollRef.current = false;

    pdfScaleRef.current = 1;
    setPdfScale(1);

    showVerbsRef.current = true;
    setShowVerbs(true);
    showConjucationsRef.current = true;
    setShowConjucations(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePdfPageChange(e);
    }
  };

  const handleBackgroundColour = (colour) => {
    if(colour == 1)
    {
      backgroundColourRef.current = [0,0,0];
      setBackgroundColour([0,0,0]);
      backgroundColourSelectionRef.current = 1;
    }
    else if(colour == 2)
    {
      backgroundColourRef.current = [6,118,3];
      setBackgroundColour([6,118,3]);
      backgroundColourSelectionRef.current = 2;
    }
    else if(colour == 3)
    {
      backgroundColourRef.current = [0,123,229];
      setBackgroundColour([0,123,229]);
      backgroundColourSelectionRef.current = 3;
    }
    else if(colour == 4)
    {
      backgroundColourRef.current = [211,46,63];
      setBackgroundColour([211,46,63])
      backgroundColourSelectionRef.current = 4; 
    }
    else if(colour == 5)
    {
      backgroundColourRef.current = [78,53,22];
      setBackgroundColour([78,53,22]);
      backgroundColourSelectionRef.current = 5;
    }
    else if(colour == 6)
    {
      backgroundColourRef.current = [251,192,45];
      setBackgroundColour([251,192,45]);
      backgroundColourSelectionRef.current = 6;
    }
    else if(colour == 7)
    {
      backgroundColourRef.current = [245,124,0];
      setBackgroundColour([245,124,0]);
      backgroundColourSelectionRef.current = 7;
    }
    else if(colour == 8)
    {
      backgroundColourRef.current = [142,36,170];
      setBackgroundColour([142,36,170]);
      backgroundColourSelectionRef.current = 8;
    }
  };

  function findMaxWordsinLine(textArray) {
    let maxWords = 0; // Variable to store the maximum number of words
  
    // Iterate through each line in the 2D array
    for (let i = 0; i < textArray.length; i++) {
      const wordCount = textArray[i].length; // Count the number of words in the current line
  
      // Update the maximum word count and line index if the current line has more words
      if (wordCount > maxWords)
        maxWords = wordCount;
    }
  
    return maxWords;
  }

  /* Reading mode parameters */

  const highlightSpeedRef = useRef(2);
  const [highlightSpeed, setHighlightSpeed] = useState(2);
  const wordCountRef = useRef(1);
  const [wordCount, setWordCount] = useState(1);
  const maxWordCountRef = useRef(0);
  const [yCoord, setYCoord] = useState(0);
  const yCoordRef = useRef(yCoord);
  const [prevLineUnblur, setPrevLineUnblur] = useState(false);
  const prevLineUnblurRef = useRef(prevLineUnblur);
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollRef = useRef(autoScroll);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(3);
  const autoScrollSpeedRef = useRef(autoScrollSpeed);
  const [unblurredLines, setUnblurredLines] = useState(1);
  const unblurredLinesRef = useRef(unblurredLines);
  const [calibrationAccuracy, setCalibrationAccuracy] = useState(0);

  const pauseStatusRef = useRef(true);
  const [pauseStatus, setPauseStatus] = useState(true);
  const resetStatusRef = useRef(true);
  const [resetStatus, setResetStatus] = useState(true);

  const showVerbsRef = useRef(true);
  const [showVerbs, setShowVerbs] = useState(true);
  const showConjucationsRef = useRef(true);
  const [showConjucations, setShowConjucations] = useState(true);

  const readingSpeedRef = useRef(0);

  const normalReadingSettings = useRef([backgroundColourRef, backgroundBrightnessRef, pdfScaleRef, pdfCurrentPageRef, pdfTotalPagesRef, pdfSetPageRef, isPDFRef]);
  const RSVPSettings = useRef([fontStyleRef, fontSizeRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, highlightSpeedRef, wordCountRef, readingSpeedRef, isOnBreak, pauseStatusRef, resetStatusRef, fileNameRef, parsedTextRef]);
  const speedReadingSettings = useRef([fontStyleRef, fontSizeRef, textOpacityRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, highlightSpeedRef, readingSpeedRef, isOnBreak, pauseStatusRef, resetStatusRef, fileNameRef, parsedTextRef]);
  const lineUnblurSettings = useRef([fontStyleRef, fontSizeRef, textOpacityRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, highlightSpeedRef, yCoordRef, prevLineUnblurRef, autoScrollRef, autoScrollSpeedRef, unblurredLinesRef, readingSpeedRef, isOnBreak, pauseStatusRef, resetStatusRef, fileNameRef, parsedTextRef]);
  const nlpSettings = useRef([fontStyleRef, fontSizeRef, textOpacityRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, showVerbsRef, showConjucationsRef, fileNameRef, parsedTextRef]);

  const handleHighlightSpeed = (event, newValue) => {
    highlightSpeedRef.current = newValue;
    setHighlightSpeed(newValue);
  };

  const handleWordCount = (event, newValue) => {
    wordCountRef.current = newValue;
    setWordCount(newValue);
  };

  const handleReadingModeSelection = (mode) => () => {
    pauseStatusRef.current = true;
    setPauseStatus(pauseStatusRef.current);
    readingSpeedRef.current = 0; // reset reading speed when changing reading mode
    readingMode.current = mode;
    setMode(mode);
  };

  const setPauseStatusValues = () => {
    pauseStatusRef.current = !pauseStatusRef.current;
    setPauseStatus(pauseStatusRef.current);
  };

  const resetHighlighting = () => {
    pauseStatusRef.current = true;
    setPauseStatus(pauseStatusRef.current);
    resetStatusRef.current = true;
    setResetStatus(true);
  };

  const handleYCoord = (yCoord) => {
    yCoordRef.current = yCoord;
    setYCoord(yCoordRef.current);
  };
  
  const handlePrevLineUnblur = () => {
    prevLineUnblurRef.current = !prevLineUnblurRef.current;
    setPrevLineUnblur(prevLineUnblurRef.current);
  };

  const handleAutoScroll = () => {
    autoScrollRef.current = !autoScrollRef.current;
    setAutoScroll(autoScrollRef.current);
  };

  const handleAutoScrollSpeed = (event) => {
    autoScrollSpeedRef.current = event.target.value;
    setAutoScrollSpeed(autoScrollSpeedRef.current);
  };

  const handleUnblurredLines = (event) => {
    unblurredLinesRef.current = event.target.value;
    setUnblurredLines(unblurredLinesRef.current);
  };

  const intervalRef = useRef(null);

  const [open, setOpen] = useState(true);

  const handleDrawer = () => {
    setOpen(!open);
  };

  const { toNotAuthorized, toDrive, toCalibration } = useNavigation();

  useEffect(() => {
    if(readingMode.current === 4)
      lineSpacingRef.current = 7;
    else
      lineSpacingRef.current = 2;

    if(readingMode.current === 2)
      highlightSpeedRef.current = 5;
    else
      highlightSpeedRef.current = 2;

    webgazer.hideGazeDot(readingMode.current);
  }, [readingMode.current]);

  useEffect(() => {
    window.scrollTo({ top: 0 }); // auto-scroll to the top
  }, [isLoading]);

  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = 'hidden';

    // Cleanup to restore scrolling on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const readingModeButtonSelection = (mode) => ({
    border: (hideSettings == 1 && mode != 1) || (hideSettings == 2 && mode != 2 && mode != 3 && mode != 4 && mode != 5) ? "1px dashed red" : readingMode.current == mode ? "3px solid #06760D" : "normal",
    color: (hideSettings == 1 && mode != 1) || (hideSettings == 2 && mode != 2 && mode != 3 && mode != 4 && mode != 5) ? "red" : "auto",
    borderColor: (hideSettings == 1 && mode != 1) || (hideSettings == 2 && mode != 2 && mode != 3 && mode != 4 && mode != 5) ? "red" : "auto",
  });

  const getCalibration = async () => {
    try
    {
      if(localStorage.getItem("calibration") && localStorage.getItem("accuracy"))
      {
        var calibrationData = JSON.parse(localStorage.getItem("calibration"));
        webgazer.setRegressionData(calibrationData);
        var accuracy = JSON.parse(localStorage.getItem("accuracy"));
        setCalibrationAccuracy(accuracy);
      }
      else
      {
        const responseMsg = await reauthenticatingFetch("GET",`${baseURL}/api/user/calibration-retrieval/`)
    
        if (responseMsg.error) // if the JSON response contains an error, this means that no calibration data is found in database
        {
          // set accuracy to -1 to indicate that no calibration data is found
          setCalibrationAccuracy(-1);
        }
        else
        {
          var calibrationData = responseMsg.calibration_values;
          webgazer.setRegressionData(calibrationData);
        }
      }
    }
    catch(error)
    {
      console.error("Failed to load calibration data from localStorage and server:", error);
      setCalibrationAccuracy(-1);
    }
  };

  // Webgazer initialisation
  useEffect(() => {
    const initializeWebGazer = async () => {

        webgazer.params.showVideo = false;
        webgazer.params.showGazeDot = true;
        webgazer.params.showVideoPreview = false;
        webgazer.params.saveDataAcrossSessions = false;
        webgazer.params.showFaceOverlay = false;
        webgazer.setRegression("weightedRidge");

        // change moveTickSize, videoViewerWidth and videoViewerHeight for accuracy
        webgazer.params.videoViewerWidth = 1920;
        webgazer.params.videoViewerHeight = 1080;
        webgazer.params.moveTickSize = 25;

        try
        {     
          await webgazer.begin(false);
          
          await getCalibration();

          setWebgazerLoading(false);
          setWebgazerFinished(true);
          console.log("WebGazer initialized successfully");
          setStartTimer(true);
        }
        catch(webgazerError)
        {
          console.error("Failed to initialize WebGazer:", webgazerError);
          setWebgazerFinished(true);
          document.getElementById("webgazerLoading").style.visibility  = "hidden";
          // Show alert for user to enable camera permissions
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
                setWebgazerFinished(false);
                if(document.getElementById("webgazerLoading"))
                  document.getElementById("webgazerLoading").style.visibility  = "visible";
              }
          }); 
        }

    };

    if(isLoading && !webgazerFinished)
      initializeWebGazer();

  }, [isLoading, webgazerFinished]);

  // WebSocket connection
  const connectWebSocket = async () => {
    setRetryConnection(1);
    const token = localStorage.getItem("authTokens"); // Assuming token is stored in localStorage

    const cleanBaseURL = baseURL.replace(/^https?:\/\//, ""); // remove 'http://' or 'https://' from baseURL when connecting using WebSocket
    
    if(config.debug)
      socket.current = new WebSocket(`ws://${cleanBaseURL}/ws/video/?token=${token}`);
    else
      socket.current = new WebSocket(`wss://${cleanBaseURL}/ws/video/?token=${token}`);

    // console.log("Connecting to WebSocket...");

    socket.current.onopen = async() => {
    await getCalibration();
    setRetryConnection(0);
    setStatusConn(true);
    }
    socket.current.onclose = async(event) => {
      socket.current = null;
      setStatusConn(false);
      setRetryConnection(2);
      setCalibrationAccuracy(-1);
    };
    socket.current.onerror = async(event) => {
      await reauthenticatingFetch("GET", `${baseURL}/api/user/profile/`);
      console.log("Reconnecting to WebSocket...");
      connectWebSocket(); // Retry WebSocket connection after refreshing the access token using above request
      // toNotAuthorized();
    };
  };

  useEffect(() => {
    if (!socket.current && !isLoading && webgazerFinished) {
      connectWebSocket();
    }

    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading]);

var total_frames = 0;
var previous_total_count = 0;
var previous_total_time = 0;

var sent_frames = 0;
var previous_time = 0;
var previous_count = 0;

var previous_send_time = 0;


// Initialize state for previous frame data URL
const previousFrameDataUrl = useRef(null);

useEffect(() => {
  if(readingMode.current === 4 && calibrationAccuracy !== -1)
    fpsIntervalRef.current = 20; // stabalises frame rate to 15 FPS for line unblurring
  else
    fpsIntervalRef.current = 60; // stabalises frame rate to 15 FPS for other reading modes
}, [readingMode.current]);


const sendVideoFrame = useCallback(async (xCoord, yCoord, canvas) => {
  if (socket.current && socket.current.readyState === WebSocket.OPEN) {
    if(isOnBreak.current == false)
    {
      const timestamp = Date.now(); // Get current timestamp of current frame
      const frame = canvas.toDataURL("image/jpeg");

      // Compare current frame with the previous frame
      if (frame !== previousFrameDataUrl.current) {

        // Calculate the time difference between the current frame and the last sent frame
        const timeDiff = timestamp - previous_send_time;

        if(previous_total_time === 0)
        {
            previous_total_time = timestamp;
            previous_total_count = 1;
        }

        // Only send the frame if the time difference is greater than or equal to (1000 / fpsLimit)
        if (timeDiff >= fpsIntervalRef.current) {   

          // Send the frame via WebSocket
          socket.current.send(
            JSON.stringify({
              frame: frame,
              timestamp: timestamp,
              xCoordinatePx: xCoord,
              yCoordinatePx: yCoord,
              mode: "reading",
              reading_mode: readingMode.current,
              wpm: readingSpeedRef.current,
            })
          );

          previous_send_time = timestamp;

          if (previous_time === 0)
          {
              previous_time = timestamp;
              previous_count = 1;
          }

          sent_frames += 1;

          if (sent_frames % 30 === 0) {
              const actualFPS = ((sent_frames - previous_count) / ((timestamp - previous_time) / 1000));
              window.console.log("Actual FPS: ", actualFPS);
              console.log("Frames sent: ", sent_frames, "Timestamp: ", timestamp, "X: ", xCoord, "Y: ", yCoord, "Actual FPS: ", actualFPS);
              previous_time = timestamp;
              previous_count = sent_frames;
          }
        }

        total_frames += 1;

        // Calculate and log FPS every 20 sent frames
        if (total_frames % 30 === 0) {
            const FPS = ((total_frames - previous_total_count) / ((timestamp - previous_total_time) / 1000));
            // console.log("Frames: ", total_frames, "Timestamp: ", timestamp, "X: ", xCoord, "Y: ", yCoord, "FPS: ", FPS);
            previous_total_time = timestamp;
            previous_total_count = total_frames;
        }

        // Update the previous frame data URL and timestamp
        previousFrameDataUrl.current = frame;
      }

      handleYCoord(yCoord);
    }
  }
  else
  {
    // console.error("WebSocket connection no longer open.");
    total_frames = 0;
    setStatusConn(false);
    webgazer.clearGazeListener();
  }
}, []);

const gazeListener = (data, canvas) => {
  if (data) {
    sendVideoFrame(data.x, data.y, canvas);
  } else {
    sendVideoFrame(null, null, canvas);
  }
};

useEffect(() => {
  if (connectionOpen) {
    webgazer.setGazeListener(gazeListener);
  }
  else
  {
    if(retryConnection !== 1)
      setRetryConnection(2);
  }
}, [connectionOpen, sendVideoFrame]);

  if (isLoading) {
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
        <Typography variant="h5" style={{ marginBottom: "2vh" }}>
          Loading WebGazer...
        </Typography>
        <LinearProgress
          style={{ width: "80%", marginTop: "2vh" }}
        />
      </div>
    );
  }

  return (
    <Box style={{marginTop: "15vh", justifyContent: "center"}}>
        <Collapse in={isNoFaceDetected === false} sx={{position: "absolute", bottom: retryConnection === -1 ? "5vh" : calibrationAccuracy === -1 && readingMode.current === 4 ? "21vh" : "13vh", left: "5vh", zIndex: 1500}}>
          <Alert variant="filled" icon={<FaceRetouchingOffRoundedIcon size="20px" color="white" sx={{display: "flex", alignItems: "center"}}/>} severity="warning">
            Minimal face detection during the last {timeLimit > 1 ? `${timeLimit} minutes` : "minute"}. Please keep your face in view.
          </Alert>
        </Collapse>
        {
          readingMode.current === 4 && hideSettings !== 1 ? (
          <Collapse in={calibrationAccuracy === -1} sx={{position: "absolute", bottom: retryConnection === -1 ? "5vh" : "13vh", left: "5vh", zIndex: 1500}}>
            { retryConnection === 2 ? (
            <Alert variant="filled" severity="warning">
              No calibration data found. Please check your connection.
            </Alert>
              ) : (
            (retryConnection <= 0 && calibrationAccuracy === -1) && (
            <Alert variant="filled" severity="warning">
              No calibration data found. Please calibrate before using this reading mode.
            </Alert>
            ))}
          </Collapse>
          ) : ( null )
        }
        <Collapse in={retryConnection === 0} sx={{position: "absolute", bottom: "5vh", left: "5vh", zIndex: 1500}}>
          <Alert variant="filled" severity="success" onClose={() => setRetryConnection(-1)}>
            Connection to server successful.
          </Alert>
        </Collapse>
        <Collapse in={retryConnection === 1} sx={{position: "absolute", bottom: "5vh", left: "5vh", zIndex: 1500}}>
          <Alert variant="filled" icon={<CircularProgress size="20px" color="white" sx={{display: "flex", alignItems: "center"}}/>} severity="info">
            Connecting...
          </Alert>
        </Collapse>
        <Collapse in={retryConnection === 2} sx={{position: "absolute", bottom: "5vh", left: "5vh", zIndex: 1500}}>
          <Alert variant="filled" severity="error" 
          action={
            <IconButton onClick={() => connectWebSocket()} color="inherit" size="small"><ReplayRoundedIcon fontSize="small"/></IconButton>
          }>
            Connection lost. Click here to retry.
          </Alert>
        </Collapse>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row"}}>
        {/* Create all reading mode components here */}
        {
        readingMode.current === 1 ? <NormalReading file={fileRef.current} textSettings={normalReadingSettings}/>
        : readingMode.current === 2 ? <RSVP textSettings={RSVPSettings}/>
        : readingMode.current === 3 ? <SpeedReading textSettings={speedReadingSettings}/>
        : readingMode.current === 4 ? <LineUnblur textSettings={lineUnblurSettings}/>
        : <NLP textSettings={nlpSettings}/>
        }
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "85vh", ml: "1.5vw", backgroundColor: "white", mt: "-7vh"}}>
          <Box sx={{backgroundColor: "white", zIndex: 1500, borderRadius: "5px", border: "1px solid #ccc", mt: "1vh"}}>
            <Tooltip title="Typography settings" placement="left">
              <IconButton 
                color="inherit"
                sx={{zIndex: 1500}}
                onClick={handleDrawer}
              >
                <MenuIcon sx={{ fontSize: "30px"}}/>
              </IconButton>
            </Tooltip>
            <Divider sx={{ zIndex: 1500, width: '100%', backgroundColor: 'gray' }} />
            <Tooltip title="Back to your Drive" placement="left">
              <IconButton 
                  color="inherit"
                  sx={{zIndex: 1500}}
                  onClick={() => {webgazer.end(); toDrive(0);}}
                >
                <ExitToAppRoundedIcon sx={{ fontSize: "30px"}}/>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <Drawer
        sx={{
          width: "30vw",
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: "30vw",
            height: "95vh",
            marginTop: "10vh",
            border: "1px solid #ccc",
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        {/* Drawer contents */}
        <Box sx={{overflowY: "auto", height: "85vh", userSelect: "none"}}> 
          <Container>
            <Typography variant="h4" sx={{mt: "4vh"}}>Settings</Typography>
          </Container>

          {/* Reading mode settings - display specific settings based on selected mode*/}

          <Container>
            <Typography variant="h6" sx={{mt: "2vh"}}>Reading Mode</Typography>
            <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center"}}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Grid2 container spacing={0.5} justifyContent="center" width="100%">
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 1 - Normal Reading" placement="top">
                      <Button variant="outlined" sx={readingModeButtonSelection(1)} onClick={handleReadingModeSelection(1)}><Box>1</Box></Button> {/* Reading Mode 1 - default */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 2 - Speed Reading (RSVP)" placement="top">
                      <Button  variant="outlined" sx={readingModeButtonSelection(2)} onClick={handleReadingModeSelection(2)}><Box>2</Box></Button> {/* Reading Mode 2 */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 3 - Speed Reading (Highlighting) " placement="top">
                      <Button  variant="outlined" sx={readingModeButtonSelection(3)} onClick={handleReadingModeSelection(3)}><Box>3</Box></Button> {/* Reading Mode 3 */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 4 - Line-by-line unblurring" placement="top">
                      <Button variant="outlined" sx={readingModeButtonSelection(4)} onClick={handleReadingModeSelection(4)}><Box>4</Box></Button> {/* Reading Mode 4 */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 5 - NLP" placement="top">
                      <Button  variant="outlined" sx={readingModeButtonSelection(5)} onClick={handleReadingModeSelection(5)}><Box>5</Box></Button> {/* Reading Mode 5 */}
                    </Tooltip>
                  </Grid2>
                </Grid2>
              </Box>
            </Container>

            { readingMode.current === 1 ? ( // Normal render
            isPDFRef.current ? (
              <Box>
                  <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
                    <ZoomInRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
                    <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                      <Typography variant="caption">
                        Scale
                      </Typography>
                      <Slider
                        value={typeof pdfScaleRef.current === 'number' ? pdfScaleRef.current : 1}
                        onChange={handlePdfScale}
                        min={0.5}
                        step={0.1}
                        max={2.0}
                        sx={{ width: "15vw" }}
                      />
                    </Box>
                    <Typography variant="h7"
                      sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
                    >
                      {parseInt(pdfScaleRef.current*100)}
                    </Typography>
                </Container>
                <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
                  <TextField
                    label="Page Number"
                    type="number"
                    value={pdfCurrentPageRef.current}
                    onChange={(e) => pdfCurrentPageRef.current = e.target.value}
                    onKeyDown={(e) => handleKeyPress(e)}
                    onBlur={(e) => handlePdfPageChange(e)}
                    slotProps={{ htmlInput: { min: 1, max: pdfTotalPagesRef.current } }}
                    sx={{ width: '100px', mr: 2, '& .MuiInputLabel-root': {color: 'black', fontSize: "0.95rem"} }}
                  />
                  <Typography sx={{mr: "2vw"}}> / {pdfTotalPagesRef.current}</Typography>
                  {/* <Button variant="contained">Go</Button> */}
                </Container>
              </Box>
             ) : null 
            ): readingMode.current === 2 | readingMode.current === 3 ? ( // Speed reading
            <Box>
              <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <Box sx={{ display: "flex", flexDirection: "column"}}>
                <Typography variant="caption">
                    Playback
                </Typography>
                <Grid2 container spacing={2} width="100%" sx={{mt: "1vh", alignItems: "center", justifyContent: "center"}}>
                  <Grid2 item xs={4}>
                    <Tooltip title={pauseStatus === true ? "Play" : "Pause"} placement="top">
                      <Button variant={pauseStatus === true ? "contained" : "outlined"} sx={{color: pauseStatus === true ? "white" : "black"}} onClick={() => setPauseStatusValues()}>{pauseStatus === true ? <PlayArrowRoundedIcon/> : <PauseRoundedIcon/>}</Button> {/* Reading Mode 2 */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Start from beginning" placement="top">
                      <Button variant="outlined" sx={{color: "black"}} onClick={() => resetHighlighting()}><SkipPreviousRoundedIcon/></Button> {/* Reading Mode 1 - default */}
                    </Tooltip>
                  </Grid2>
                </Grid2>
              </Box>
            </Container>
              <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
                <SpeedRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
                  <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                    <Typography variant="caption">
                      {readingMode.current === 3 ? "Highlighting speed" : "Speed" }
                    </Typography>
                    <Slider
                      value={typeof highlightSpeedRef.current === 'number' ? highlightSpeedRef.current : 2}
                      onChange={handleHighlightSpeed}
                      min={1}
                      step={1}
                      max={10}
                      sx={{ width: "15vw" }}
                    />
                  </Box>
                  <Typography variant="h7"
                    sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
                  >
                    {readingMode.current === 3 ? highlightSpeedRef.current*60 : readingMode.current === 2 ? (highlightSpeedRef.current * wordCountRef.current * 60) : highlightSpeedRef.current}
                  </Typography>
              </Container>
              { readingMode.current === 2 ? (
                parsedText.length !== 0 ? (
                  <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
                    <TextIncreaseIcon sx={{fontSize: "30px", mr: "2vw"}}/>
                      <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                        <Typography variant="caption">
                          Word count
                        </Typography>
                        <Slider
                          value={typeof wordCountRef.current === 'number' ? wordCountRef.current : 1}
                          onChange={handleWordCount}
                          min={1}
                          step={1}
                          max={maxWordCountRef.current >= 10 ? 10 : maxWordCountRef.current}
                          sx={{ width: "15vw" }}
                        />
                      </Box>
                      <Typography variant="h7"
                        sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
                      >
                        {wordCountRef.current}
                      </Typography>
                  </Container>
                ) : null
              ) : null }
          </Box>
            ): readingMode.current === 4 ? ( // Line-by-line unblurring
            <Box>
              <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center", justifyContent: "center"}}>
                <Tooltip title={retryConnection !== 2 ? "Check or update calibration details" : "Check your connection before calibration"} placement="left">  
                {calibrationAccuracy === -1 && hideSettings !== 1 ? (
                  <FlashingButton variant="outlined" sx={{ml: "1vw"}} onClick={retryConnection !== 2 ? () => { webgazer.end(); toCalibration(file, parsedText); } : null}>
                    {retryConnection <= 0 ? "Start calibration" : "Check connection"}
                  </FlashingButton>
                ) : (
                  <Button variant="contained" sx={{ml: "1vw"}} onClick={() => {webgazer.end(); toCalibration(file,parsedText);}}>
                    Check calibration
                  </Button>
                )
                }
                </Tooltip>
              </Container>
              <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center"}}>
                <Tooltip title="Reveal the lines above the highlighted one" placement="left">  
                  <Checkbox checked={prevLineUnblur} onChange={handlePrevLineUnblur}/>
                  <Typography variant="caption" sx={{ml: "1vw"}}>
                    Unblur previously viewed lines
                  </Typography>
                </Tooltip>
              </Container>
              <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center"}}>
                <Tooltip title="Scrolls down automatically when you look at the bottom of the text." placement="left">  
                  <Checkbox checked={autoScroll} onChange={handleAutoScroll}/>
                  <Typography variant="caption" sx={{ml: "1vw"}}>
                    Auto-scroll
                  </Typography>
                </Tooltip>
              </Container>
              {autoScroll ? (
              <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
                  <SpeedRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
                  <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                  <Typography variant="caption">
                    Auto-scroll speed
                  </Typography>
                  <Slider
                    value={typeof autoScrollSpeedRef.current === 'number' ? autoScrollSpeedRef.current : 3}
                    onChange={handleAutoScrollSpeed}
                    min={1}
                    step={1}
                    max={10}
                    sx={{ width: "15vw" }}
                  />
                  </Box>
                  <Typography variant="h7"
                    sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
                  >
                    {autoScrollSpeedRef.current}
                  </Typography>
              </Container>
              ) : null}
              <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <FormatLineSpacingRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Line Spacing
                </Typography>
                <Slider
                  value={typeof lineSpacingRef.current === 'number' ? lineSpacingRef.current : 2}
                  onChange={handleLineSpacing}
                  min={1}
                  max={10}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {lineSpacingRef.current*10}
              </Typography>
              </Container>
              <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
                <DeblurRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
                <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                  <Typography variant="caption">
                  Unblur size
                  </Typography>
                  <Slider
                    value={typeof unblurredLinesRef.current === 'number' ? unblurredLinesRef.current : 1}
                    onChange={handleUnblurredLines}
                    min={1}
                    step={1}
                    max={5}
                    sx={{ width: "15vw" }}
                  />
                </Box>
                <Typography variant="h7"
                  sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
                >
                  {unblurredLinesRef.current}
                </Typography>
              </Container>
            </Box> 
            ): // NLP reading
            <Box>
              <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
                <Tooltip title="Italicise all verbs in the text" placement="left">  
                  <Checkbox checked={showVerbsRef.current} onChange={() => {showVerbsRef.current = !showVerbsRef.current; setShowVerbs(showVerbsRef.current);}}/>
                  <Typography variant="caption" sx={{ml: "1vw"}}>
                    Highlight verbs
                  </Typography>
                </Tooltip>
              </Container>
              <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center"}}>
                <Tooltip title="Underline all conjucations in the text" placement="left">  
                  <Checkbox checked={showConjucationsRef.current} onChange={() => {showConjucationsRef.current = !showConjucationsRef.current; setShowConjucations(showConjucationsRef.current);}}/>
                  <Typography variant="caption" sx={{ml: "1vw"}}>
                    Highlight conjucations
                  </Typography>
                </Tooltip>
              </Container>
            </Box>
            }
            <Divider sx={{width: "80%", mt: "4vh"}}/>
          </Container>

          {/* Text layout settings */}
          { readingMode.current !== 1 ? (
          <Container>
            <Typography variant="h6" sx={{mt: "2vh"}}>Text Layout</Typography>

            <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center"}}>
              <Box sx={{ display: "flex", flexDirection: "column", width: '100%'}}>
                <Typography variant="caption">
                  Font Style
                </Typography>
                <FormControl variant="outlined" fullWidth>
                  <Select
                    value={fontStyleRef.current}
                    onChange={handleFontStyle}
                    fullWidth
                    sx={{ backgroundColor: "#D9D9D9" }}
                  >
                  {fontOptions.map((font, index) =>
                    font.type === "header" ? (
                      <ListSubheader key={`header-${index}`}>{font.label}</ListSubheader>
                    ) : (
                      <MenuItem key={font.value} value={font.value}>
                        {font.label}
                      </MenuItem>
                    )
                  )}
                  </Select>
                </FormControl>
              </Box>
            </Container>

            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <FormatSizeRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Text Size
                </Typography>
                <Slider
                  value={typeof fontSizeRef.current === 'number' ? fontSizeRef.current : 28}
                  onChange={handleFontSize}
                  min={8}
                  max={100}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {fontSizeRef.current}
              </Typography>
            </Container>

            { readingMode.current !== 2 ? (
            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <OpacityIcon sx={{fontSize: "30px", mr: "2vw"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Text Opacity
                </Typography>
                <Slider
                  value={typeof textOpacityRef.current === 'number' ? textOpacityRef.current : 1}
                  onChange={handleTextOpacity}
                  min={0.1}
                  step={0.1}
                  max={1}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {textOpacityRef.current*100}
              </Typography>
            </Container>
            ) : null }

            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <FormatLineSpacingRoundedIcon sx={{fontSize: "30px", mr: "2vw", transform: "rotate(270deg)"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Letter Spacing
                </Typography>
                <Slider
                  value={typeof letterSpacingRef.current === 'number' ? letterSpacingRef.current : 2}
                  onChange={handleLetterSpacing}
                  min={-2}
                  step={0.1}
                  max={10}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {letterSpacingRef.current*10}
              </Typography>
            </Container>

            { readingMode.current !== 2 && readingMode.current !== 4 ? (
            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <FormatLineSpacingRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Line Spacing
                </Typography>
                <Slider
                  value={typeof lineSpacingRef.current === 'number' ? lineSpacingRef.current : 2}
                  onChange={handleLineSpacing}
                  min={1}
                  max={10}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {lineSpacingRef.current*10}
              </Typography>
            </Container>
            ) : null}
            <Divider sx={{width: "80%", mt: "4vh"}}/>
          </Container>
          ) : null}

          {/* Background settings */}

          <Container>
            <Typography variant="h6" sx={{mt: "2vh"}}>Background</Typography>

            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <Brightness6RoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Brightness
                </Typography>
                <Slider
                  value={typeof backgroundBrightnessRef.current === 'number' ? backgroundBrightnessRef.current : 1}
                  onChange={handleBackgroundBrightness}
                  min={0}
                  step={0.1}
                  max={1}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {backgroundBrightnessRef.current*100}
              </Typography>
            </Container>

            <Container sx={{display: "flex", flexDirection: "column", mt: "2vh", alignItems: "center"}}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" sx={{mt: "2vh", mb: "2vh"}}>
                  Colour scheme
                </Typography>
                <Grid2 container spacing={2} justifyContent="center" width="100%">
                  <Grid2 item xs={4}>
                    <Tooltip title="Monochrome" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(1)} onClick={() => handleBackgroundColour(1)}><Box sx={colourSchemeButton("black")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("black")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* White - default */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Green" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(2)} onClick={() => handleBackgroundColour(2)}><Box sx={colourSchemeButton("rgb(6,118,3)")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(6,118,3)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Green */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Blue" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(3)} onClick={() => handleBackgroundColour(3)}><Box sx={colourSchemeButton("rgb(0,123,229)")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(0,123,229)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Blue */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Red" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(4)} onClick={() => handleBackgroundColour(4)}><Box sx={colourSchemeButton("rgb(211,46,63)")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(211,46,63)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Red */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Brown" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(5)} onClick={() => handleBackgroundColour(5)}><Box sx={colourSchemeButton("rgb(78,53,22)")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(78,53,22)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Brown */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Yellow" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(6)} onClick={() => handleBackgroundColour(6)}><Box sx={colourSchemeButton("rgb(251,192,45)")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(251,192,45)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Yellow */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Orange" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(7)} onClick={() => handleBackgroundColour(7)}><Box sx={colourSchemeButton("rgb(245,124,0)")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(245,124,0)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Orange */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Purple" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(8)} onClick={() => handleBackgroundColour(8)}><Box sx={colourSchemeButton("rgb(142,36,170)")}>{readingMode.current !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(142,36,170)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Purple */}
                    </Tooltip>
                  </Grid2>
                </Grid2>
              </Box>
            </Container>

            <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center", justifyContent: "center"}}>
              <Button onClick={setDefaultSettings} sx={{mt: "2vh"}}>Reset settings</Button>
            </Container>  

          </Container>
        </Box>
      </Drawer>
    </Box>
  );
  }

export default TextReaderPage;
