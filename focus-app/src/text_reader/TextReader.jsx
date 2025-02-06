import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "../utils/navigation";
import { useLocation } from 'react-router-dom';

import webgazer from "../webgazer/webgazer.js";

import NormalReading from "./NormalReading";
import { sendReadingProgress, SpeedReading } from "./SpeedReading";
import { sendReadingProgressRSVP, RSVP } from "./RSVP";
import { sendReadingProgressLineUnblur, LineUnblur } from "./LineUnblur";
import { NLP } from "./NLP";

/* MaterialUI Imports */
import { Button, Typography, Container, Box, LinearProgress, IconButton, Tooltip, Divider, Drawer, Slider, Select, MenuItem, FormControl, Grid2, TextField, Checkbox } from "@mui/material";

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
} from '@mui/icons-material';

function TextReaderPage() { 
  // const videoRef = useRef(null);
  const socket = useRef(null);
  // const [stream, setStream] = useState(null);
  // const [streamObtained, setStreamStatus] = useState(false);
  const [connectionOpen, setStatusConn] = useState(false);
  const [framesData, setFramesData] = useState([]);
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setWebgazerLoading] = useState(true);

  const location = useLocation();
  const { file, parsedText } = location.state || {};
  const fileNameRef = useRef(file.name);
  const parsedTextRef = useRef(parsedText);

  /* Reading mode index
    1 - Normal reading
    2 - RSVP
    3 - Speed reading (word highlighting)
    4 - Line by line unblurring
    5 - Natural Language Processing (NLP) assistance
  */
  const [readingMode, setReadingMode] = useState(3);

  /* Text typography parameters */

  const fontOptions = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Istok Web', value: 'Istok Web, sans-serif' }, // default text font
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' }
    // add more font options here
  ];

  const fontStyleRef = useRef(fontOptions[3].value);
  const fontSizeRef = useRef(28);
  const textOpacityRef = useRef(0.5);
  const letterSpacingRef = useRef(0);
  const lineSpacingRef = useRef(2);
  const backgroundBrightnessRef = useRef(0);
  const invertTextColourRef = useRef(false);
  const backgroundColourRef = useRef([0, 0, 0]);
  const backgroundColourSelectionRef = useRef(1);

  const pdfScaleRef = useRef(1);
  const pdfCurrentPageRef = useRef(1);
  const pdfTotalPagesRef = useRef(1);
  const pdfSetPageRef = useRef(false);
  const isPDFRef = useRef(false);

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
    backgroundColor: readingMode !== 1 ? invertTextColourRef.current ? colour : "white" : colour
  });

  const colourSchemeIconColour = (colour) => ({
    fontSize: "30px", color: invertTextColourRef.current ? "white" : colour
  });

  const handleFontStyle = (event) => {
    fontStyleRef.current = event.target.value;
  };

  const handleFontSize = (event) => {
    fontSizeRef.current = event.target.value;
  };

  const handleTextOpacity = (event) => {
    textOpacityRef.current = event.target.value;
  };

  const handleBackgroundBrightness = (event) => {
    backgroundBrightnessRef.current = event.target.value;
    if(event.target.value > 0.5)
      invertTextColourRef.current = true;
    else
      invertTextColourRef.current = false;
  };

  const handleLetterSpacing = (event) => {
    letterSpacingRef.current = event.target.value;
  };

  const handleLineSpacing = (event) => {
    lineSpacingRef.current = event.target.value;
  };

  const handlePdfScale = (event) => {
    pdfScaleRef.current = event.target.value;
  };

  const handlePdfPageChange = (event) => {
    pdfCurrentPageRef.current = event.target.value;
    pdfSetPageRef.current = true;
  };

  const setDefaultSettings = () => {
    fontStyleRef.current = fontOptions[3].value;
    fontSizeRef.current = 28;
    textOpacityRef.current = 0.5;
    letterSpacingRef.current = 0;

    if(readingMode === 4)
      lineSpacingRef.current = 7;
    else
    lineSpacingRef.current = 2;

    backgroundBrightnessRef.current = 0;
    invertTextColourRef.current = false;
    backgroundColourRef.current = [0,0,0];
    backgroundColourSelectionRef.current = 1;

    if(readingMode === 2)
      highlightSpeedRef.current = 5;
    else
      highlightSpeedRef.current = 2;

    wordCountRef.current = 1;
    
    setPrevLineUnblur(false);
    prevLineUnblurRef.current = false;
    setAutoScroll(true);
    autoScrollRef.current = false;

    pdfScaleRef.current = 1;
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
      backgroundColourSelectionRef.current = 1;
    }
    else if(colour == 2)
    {
      backgroundColourRef.current = [6,118,3];
      backgroundColourSelectionRef.current = 2;
    }
    else if(colour == 3)
    {
      backgroundColourRef.current = [0,123,229];
      backgroundColourSelectionRef.current = 3;
    }
    else if(colour == 4)
    {
      backgroundColourRef.current = [211,46,63];
      backgroundColourSelectionRef.current = 4; 
    }
    else if(colour == 5)
    {
      backgroundColourRef.current = [78,53,22];
      backgroundColourSelectionRef.current = 5;
    }
    else if(colour == 6)
    {
      backgroundColourRef.current = [251,192,45];
      backgroundColourSelectionRef.current = 6;
    }
    else if(colour == 7)
    {
      backgroundColourRef.current = [245,124,0];
      backgroundColourSelectionRef.current = 7;
    }
    else if(colour == 8)
    {
      backgroundColourRef.current = [142,36,170];
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
  const wordCountRef = useRef(1);
  const maxWordCountRef = useRef(findMaxWordsinLine(parsedTextRef.current));
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

  const pauseStatusRef = useRef(true);
  const resetStatusRef = useRef(true);

  const normalReadingSettings = useRef([backgroundColourRef, backgroundBrightnessRef, pdfScaleRef, pdfCurrentPageRef, pdfTotalPagesRef, pdfSetPageRef, isPDFRef]);
  const speedReadingSettings = useRef([fontStyleRef, fontSizeRef, textOpacityRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, highlightSpeedRef, pauseStatusRef, resetStatusRef, fileNameRef, parsedTextRef]);
  const RSVPSettings = useRef([fontStyleRef, fontSizeRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, highlightSpeedRef, wordCountRef, pauseStatusRef, resetStatusRef, fileNameRef, parsedTextRef]);
  const lineUnblurSettings = useRef([fontStyleRef, fontSizeRef, textOpacityRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, highlightSpeedRef, yCoordRef, prevLineUnblurRef, autoScrollRef, autoScrollSpeedRef, unblurredLinesRef, pauseStatusRef, resetStatusRef, fileNameRef, parsedTextRef]);
  const nlpSettings = useRef([fontStyleRef, fontSizeRef, textOpacityRef, letterSpacingRef, lineSpacingRef, backgroundBrightnessRef, invertTextColourRef, backgroundColourRef, backgroundColourSelectionRef, highlightSpeedRef, pauseStatusRef, resetStatusRef, fileNameRef, parsedTextRef]);

  const [pauseStatus, setPauseStatus] = useState(true);

  const handleHighlightSpeed = (event, newValue) => {
    highlightSpeedRef.current = newValue;
  };

  const handleWordCount = (event, newValue) => {
    wordCountRef.current = newValue;
  };

  const handleReadingModeSelection = (mode) => () => {
    pauseStatusRef.current = true;
    setPauseStatus(pauseStatusRef.current);
    setReadingMode(mode);
  };

  const setPauseStatusValues = () => {
    pauseStatusRef.current = !pauseStatusRef.current;
    setPauseStatus(pauseStatusRef.current);
  };

  const resetHighlighting = () => {
    pauseStatusRef.current = true;
    setPauseStatus(pauseStatusRef.current);
    resetStatusRef.current = true;
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

  const [open, setOpen] = useState(false);

  const handleDrawer = () => {
    setOpen(!open);
  };

  const { toNotAuthorized, toDrive } = useNavigation();

  useEffect(() => {
    if(readingMode === 4)
      lineSpacingRef.current = 7;
    else
      lineSpacingRef.current = 2;

      if(readingMode === 2)
        highlightSpeedRef.current = 5;
      else
        highlightSpeedRef.current = 2;
  }, [readingMode]);

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
    border: readingMode == mode ? "3px solid #06760D" : "normal"
  });

  // Webgazer initialisation
  useEffect(() => {
    const initializeWebGazer = async () => {
      setWebgazerLoading(true);
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
        webgazer.params.showFaceOverlay = false;
        webgazer.setRegression("weightedRidge");

        // change moveTickSize, videoViewerWidth and videoViewerHeight for accuracy
        webgazer.params.videoViewerWidth = 1920;
        webgazer.params.videoViewerHeight = 1080;
        webgazer.params.moveTickSize = 25;

        await webgazer.begin(false);
        
        try
        {
          if(localStorage.getItem("calibration") && localStorage.getItem("accuracy"))
          {
            var calibrationData = JSON.parse(localStorage.getItem("calibration"));
            webgazer.setRegressionData(calibrationData);
          }
          else
            console.log("No calibration data found in localStorage. Data already stored in WebGazer instance during calibration.");
        }
        catch(error)
        {
          console.error("Failed to load calibration data to localStorage:", error);
        }

        /* Fetch the video stream from Webgazer */
      //   const intervalId = setInterval(() => {
      //     const stream = webgazer.getVideoStream();
      //     if (stream !== null) {
      //       setStream(stream);
      //       setStreamStatus(true);
      //       videoRef.current.srcObject = stream;
      //       clearInterval(intervalId); // Stop checking once stream is available
      //     }
      //   }, 500);

      // } catch (error) {
      //   console.error("Error initializing WebGazer:", error);
      // }

      setWebgazerLoading(false);
      clearInterval(loadingInterval);
      console.log("WebGazer initialized successfully");
    };

    initializeWebGazer();

  }, []);

  useEffect(() => {
    if (!socket.current && !isLoading) {
      const token = localStorage.getItem("authTokens"); // Assuming token is stored in localStorage
      socket.current = new WebSocket(`ws://localhost:8000/ws/video/?token=${token}`);

      console.log("Connecting to WebSocket...");

      socket.current.onopen = () => setStatusConn(true);
      socket.current.onclose = () => {
        socket.current = null;
        setStatusConn(false);
      };
      socket.current.onerror = () => {toNotAuthorized};
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

  // // FIX?
  // useEffect(() => {
  //   if(readingMode !== 4)
  //     document.getElementById(webgazer.params.gazeDotId).style.display = "hidden"; // hide the gaze dot if face is not detected
  //   else
  //     document.getElementById(webgazer.params.gazeDotId).style.display = "auto"; // hide the gaze dot if face is not detected
  // },[readingMode]);

  var total_frames = 0;
  var previous_frame = 0;
  var previous_time = 0;

// Initialize state for previous frame data URL
const previousFrameDataUrl = useRef(null);

const sendVideoFrame = useCallback(async (xCoord, yCoord, canvas) => {
  if (socket.current && socket.current.readyState === WebSocket.OPEN) {
    const timestamp = Date.now(); // Get current timestamp of current frame
    const frame = canvas.toDataURL("image/jpeg");

    // Compare current frame with the previous frame
    if (frame !== previousFrameDataUrl.current) {
      // Store image data and timestamp in framesData array
      setFramesData((prevFrames) => [
        ...prevFrames,
        { frame: frame, timestamp: timestamp, xCoordinatePx: xCoord, yCoordinatePx: yCoord },
      ]);

      // Send the frame via WebSocket
      socket.current.send(
        JSON.stringify({
          frame: frame,
          timestamp: timestamp,
          xCoordinatePx: xCoord,
          yCoordinatePx: yCoord,
        })
      );

      total_frames += 1;
      if (total_frames === 1) {
        previous_time = timestamp;
        previous_frame = total_frames;
      }
      if (total_frames % 30 === 0) {
        window.console.log("Frames sent: ", total_frames, "Timestamp: ", timestamp, "X: ", xCoord, "Y: ", yCoord);
        window.console.log("FPS: ", (total_frames - previous_frame) / ((timestamp - previous_time) / 1000));
        previous_frame = total_frames;
        previous_time = timestamp;
      }

      // Update the previous frame data URL
      previousFrameDataUrl.current = frame;
    }

    handleYCoord(yCoord);
  }
}, []);

useEffect(() => {
  if (connectionOpen) {
    webgazer.setGazeListener((data, canvas) => {
      if (data) {
        sendVideoFrame(data.x, data.y, canvas);
      } else {
        sendVideoFrame(null, null, canvas);
      }
    });
  }
}, [connectionOpen, sendVideoFrame]);

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
          userSelect: "none"
        }}
      >
        <Typography variant="h5" style={{ marginBottom: "2vh" }}>
          Loading WebGazer...
        </Typography>
        <LinearProgress
          variant="determinate"
          value={loadingProgress}
          style={{ width: "80%", marginTop: "2vh" }}
        />
      </div>
    );
  }

  return (
    <Box style={{marginTop: "15vh", justifyContent: "center"}}>
      {/* <video ref={videoRef} autoPlay width="700" height="700" style={{display: 'none'}}></video> */}
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row"}}>
        {/* Create all reading mode components here */}
        {
        readingMode === 1 ? <NormalReading file={file} parsedText={parsedText} textSettings={normalReadingSettings}/>
        : readingMode === 2 ? <RSVP textSettings={RSVPSettings}/>
        : readingMode === 3 ? <SpeedReading textSettings={speedReadingSettings}/>
        : readingMode === 4 ? <LineUnblur textSettings={lineUnblurSettings}/>
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
                  onClick={toDrive}
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
                      <Button variant="outlined" sx={readingModeButtonSelection(2)} onClick={handleReadingModeSelection(2)}><Box>2</Box></Button> {/* Reading Mode 2 */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 3 - Speed Reading (Highlighting) " placement="top">
                      <Button variant="outlined" sx={readingModeButtonSelection(3)} onClick={handleReadingModeSelection(3)}><Box>3</Box></Button> {/* Reading Mode 3 */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 4 - Line-by-line unblurring" placement="top">
                      <Button variant="outlined" sx={readingModeButtonSelection(4)} onClick={handleReadingModeSelection(4)}><Box>4</Box></Button> {/* Reading Mode 4 */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Reading Mode 5 - NLP" placement="top">
                      <Button variant="outlined" sx={readingModeButtonSelection(5)} onClick={handleReadingModeSelection(5)}><Box>5</Box></Button> {/* Reading Mode 5 */}
                    </Tooltip>
                  </Grid2>
                </Grid2>
              </Box>
            </Container>

            { readingMode === 1 ? ( // Normal render
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
            ): readingMode === 2 | readingMode === 3 ? ( // Speed reading
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
                      {readingMode === 3 ? "Highlighting speed" : "Speed" }
                    </Typography>
                    <Slider
                      value={typeof highlightSpeedRef.current === 'number' ? highlightSpeedRef.current : 2}
                      onChange={handleHighlightSpeed}
                      min={1}
                      step={readingMode === 1 ? 0.1 : 1}
                      max={10}
                      sx={{ width: "15vw" }}
                    />
                  </Box>
                  <Typography variant="h7"
                    sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
                  >
                    {readingMode === 1 ? highlightSpeedRef.current*10 : highlightSpeedRef.current}
                  </Typography>
              </Container>
              { readingMode === 2 ? (
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
                          max={maxWordCountRef.current}
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
            ): readingMode === 4 ? ( // Line-by-line unblurring
            <Box>
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
              <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center"}}>
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
            <Typography variant="h7" sx={{mt: "2vh"}}>NLP Reading Settings - TBC</Typography> //Replace with specific settings for Reading Mode 5
            }
            <Divider sx={{width: "80%", mt: "4vh"}}/>
          </Container>

          {/* Text layout settings */}
          { readingMode !== 1 ? (
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
                    {fontOptions.map((font) => (
                      <MenuItem key={font.value} value={font.value}>
                        {font.label}
                      </MenuItem>
                    ))}
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

            { readingMode !== 2 ? (
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

            { readingMode !== 2 && readingMode !== 4 ? (
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
                      <Button variant="outlined" sx={colourSchemeSelection(1)} onClick={() => handleBackgroundColour(1)}><Box sx={colourSchemeButton("black")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("black")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* White - default */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Green" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(2)} onClick={() => handleBackgroundColour(2)}><Box sx={colourSchemeButton("rgb(6,118,3)")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(6,118,3)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Green */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Blue" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(3)} onClick={() => handleBackgroundColour(3)}><Box sx={colourSchemeButton("rgb(0,123,229)")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(0,123,229)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Blue */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Red" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(4)} onClick={() => handleBackgroundColour(4)}><Box sx={colourSchemeButton("rgb(211,46,63)")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(211,46,63)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Red */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Brown" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(5)} onClick={() => handleBackgroundColour(5)}><Box sx={colourSchemeButton("rgb(78,53,22)")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(78,53,22)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Brown */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Yellow" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(6)} onClick={() => handleBackgroundColour(6)}><Box sx={colourSchemeButton("rgb(251,192,45)")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(251,192,45)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Yellow */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Orange" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(7)} onClick={() => handleBackgroundColour(7)}><Box sx={colourSchemeButton("rgb(245,124,0)")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(245,124,0)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Orange */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Purple" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(8)} onClick={() => handleBackgroundColour(8)}><Box sx={colourSchemeButton("rgb(142,36,170)")}>{readingMode !== 1 ? <SubjectIcon sx={colourSchemeIconColour("rgb(142,36,170)")}></SubjectIcon> : <ArticleTwoToneIcon sx={{color: "white"}}></ArticleTwoToneIcon>}</Box></Button> {/* Purple */}
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
