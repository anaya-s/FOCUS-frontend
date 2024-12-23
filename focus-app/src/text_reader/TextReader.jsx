import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "../utils/navigation";
import webgazer from "../webgazer/webgazer.js";

/* MaterialUI Imports */
import { Button, Typography, Container, Box, LinearProgress, IconButton, Tooltip, Divider, Drawer, Slider, Select, MenuItem, FormControl, Grid2 } from "@mui/material";

import {
  Menu as MenuIcon,
  ExitToAppRounded as ExitToAppRoundedIcon,
  FormatSizeRounded as FormatSizeRoundedIcon,
  Opacity as OpacityIcon,
  Brightness6Rounded as Brightness6RoundedIcon,
  FormatLineSpacingRounded as FormatLineSpacingRoundedIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';

import { reauthenticatingFetch } from "../utils/api";

import { handlePdfFile, handleDocxFile, handleTxtFile } from "./textParsing";

function TextReaderPage(file) {
  const videoRef = useRef(null);
  const socket = useRef(null);
  const [stream, setStream] = useState(null);
  const [streamObtained, setStreamStatus] = useState(false);
  const [connectionOpen, setStatusConn] = useState(false);
  const [framesData, setFramesData] = useState([]);
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setWebgazerLoading] = useState(true);

  /* File handling */
  const [textArray, setTextArray] = useState([]); // Stores 2D array of text (lines and words)

  const [currentLine, setCurrentLine] = useState(0); // Stores index of current line
  const [currentWord, setCurrentWord] = useState(0); // Stores index of current word

  const [fileName, setFileName] = useState("");

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

  const [fontStyle, setFontStyle] = useState(fontOptions[3].value);
  const [fontSize, setFontSize] = useState(28);
  const [textOpacity, setTextOpacity] = useState(0.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineSpacing, setLineSpacing] = useState(2);
  const [backgroundBrightness, setBackgroundBrightness] = useState(0);
  const [invertTextColour, setInvertTextColour] = useState(false);
  const [backgroundColour, setBackgroundColour] = useState([0,0,0]);
  const [backgroundColourSelection, setBackgroundColourSelection] = useState(1);

  const colourSchemeSelection = (selection) => ({
    border: backgroundColourSelection == selection ? "3px solid #06760D" : "normal"
  });
  
  const colourSchemeButton = (colour) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "5px",
    border: "1px solid #ccc",
    pt: "5px", pb: "5px",
    width: "2vw",
    backgroundColor: invertTextColour ? colour : "white"
  });

  const colourSchemeIconColour = (colour) => ({
    fontSize: "30px", color: invertTextColour ? "white" : colour
  });

  const handleFontStyle = (event) => {
    setFontStyle(event.target.value);
  };

  const handleFontSize = (event, newValue) => {
    setFontSize(newValue);
  };

  const handleTextOpacity = (event, newValue) => {
    setTextOpacity(newValue);
  };

  const handleBackgroundBrightness = (event, newValue) => {
    setBackgroundBrightness(newValue);
    if(newValue > 0.5)
      setInvertTextColour(true);
    else
      setInvertTextColour(false);
  };

  const handleLetterSpacing = (event, newValue) => {
    setLetterSpacing(newValue);
  };

  const handleLineSpacing = (event, newValue) => {
    setLineSpacing(newValue);
  };

  const setDefaultSettings = () => {
    setFontStyle(fontOptions[3].value);
    setFontSize(28);
    setTextOpacity(0.5);
    setLetterSpacing(0);
    setLineSpacing(2);
    setBackgroundBrightness(0);
    setInvertTextColour(false);
    setBackgroundColour([0,0,0]);
    setBackgroundColourSelection(1);
  };

  const handleBackgroundColour = (colour) => {
    if(colour == 1)
    {
      setBackgroundColour([0,0,0]);
      setBackgroundColourSelection(1);
    }
    else if(colour == 2)
    {
      setBackgroundColour([6,118,3]);
      setBackgroundColourSelection(2);
    }
    else if(colour == 3)
    {
      setBackgroundColour([0,123,229]);
      setBackgroundColourSelection(3);
    }
    else if(colour == 4)
    {
      setBackgroundColour([211,46,63]);
      setBackgroundColourSelection(4);
    }
    else if(colour == 5)
    {
      setBackgroundColour([78,53,22]);
      setBackgroundColourSelection(5);
    }
    else if(colour == 6)
    {
      setBackgroundColour([251,192,45]);
      setBackgroundColourSelection(6);
    }
    else if(colour == 7)
    {
      setBackgroundColour([245,124,0]);
      setBackgroundColourSelection(7);
    }
    else if(colour == 8)
    {
      setBackgroundColour([142,36,170]);
      setBackgroundColourSelection(8);
    }
  };

  const intervalRef = useRef(null);

  const [open, setOpen] = useState(false);

  const handleDrawer = () => {
    setOpen(!open);
  };

  const { toNotAuthorized } = useNavigation();

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

  // Webgazer initialisation
  useEffect(() => {
    const initializeWebGazer = async () => {
      setWebgazerLoading(true);
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
        const intervalId = setInterval(() => {
          const stream = webgazer.getVideoStream();
          if (stream !== null) {
            setStream(stream);
            setStreamStatus(true);
            videoRef.current.srcObject = stream;
            clearInterval(intervalId); // Stop checking once stream is available
          }
        }, 500);

      } catch (error) {
        console.error("Error initializing WebGazer:", error);
      }

      setWebgazerLoading(false);
    };

    initializeWebGazer();

    // Cleanup when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && !socket.current) {
      const token = localStorage.getItem("authTokens"); // Assuming token is stored in localStorage
      socket.current = new WebSocket(`ws://localhost:8000/ws/video/?token=${token}`);

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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamObtained]);

  const sendVideoFrame = useCallback((xCoord, yCoord) => {
    return new Promise((resolve, reject) => {
    if (
      videoRef.current &&
      socket.current &&
      socket.current.readyState === WebSocket.OPEN
    ) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth // 640p
      canvas.height = videoRef.current.videoHeight // 480p
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if(!(xCoord && yCoord))
        document.getElementById(webgazer.params.gazeDotId).style.display = "hidden"; // hide the gaze dot if face is not detected

      const timestamp = Date.now(); // Get current timestamp of current frame

      const frame = canvas.toDataURL("image/jpeg");

      // Store image data and timestamp in framesData array
      setFramesData((prevFrames) => [
        ...prevFrames,
        { frame: frame, timestamp: timestamp, xCoordinatePx: xCoord, yCoordinatePx: yCoord},
      ]);

      // Send the frame via WebSocket
      socket.current.send(
        JSON.stringify({
          frame: frame,
          timestamp: timestamp,
          xCoordinatePx: xCoord,
          yCoordinatePx: yCoord
        })
      );
    }
  })}, []);

  useEffect(() => {
    if (stream) {

      webgazer.setGazeListener(async(data) => { /* Start gaze coordinate tracker and obtain gaze coordinates */
        if (data) {
          webgazer.util.bound(data);
          await sendVideoFrame(data.x,data.y); // Send coordinates data with frame
        }
        else
          await sendVideoFrame(); // Send no coordinates with frame if face is not detected
      });
    }
  }, [streamObtained]);

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

  const sendReadingProgress = async () => {

    const bodyContents = { fileName: fileName,  lineNumber: currentLine };
    console.log(bodyContents);
      
    const response = await reauthenticatingFetch("POST", `http://localhost:8000/api/user/reading-progress/`, bodyContents);

    if(response.error)
        console.log(response.error);
    else
    {
      // the response should contain the line number of previous session, if exists, otherwise set current line number to 0
    }
}

  /* TEMPORARY function that iterates through each element in 2D array (every word in every line)*/
  const iterateWords = async (lines) => {
    if (lines.length) {
      for (let lineNo = currentLine; lineNo < lines.length; lineNo++) {
        for (let wordNo = currentWord; wordNo < lines[lineNo].length; wordNo++) {
          setCurrentLine(lineNo);
          setCurrentWord(wordNo);
          await new Promise((resolve) => setTimeout(resolve, 500)); // set time interval
        }
      }
    }
  };

  /* Function which handles the uploading of files, detecting whether the file types are valid */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    var parsedText = [];
    if (file) {
      if (file.type === "application/pdf") {
        // Check for .pdf file type
        parsedText = await handlePdfFile(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Check for .docx file type
        parsedText = await handleDocxFile(file);
      } else if (file.type === "text/plain") {
        // Check for .txt file type
        parsedText = await handleTxtFile(file);
      } else {
        alert("Please upload a valid PDF, DOCX, or TXT file.");
      }
    }

    setTextArray(parsedText);
    iterateWords(parsedText); // run this if speed reading mode is enabled
  };

  /* Function which manages the highlighting of words whilst reading - for speed reading mode */
  const getFormattedText = () => {
    return textArray.map((line, lineIndex) => (
      <div
        key={lineIndex}
        style={{
          filter: lineIndex <= currentLine ? "none" : "blur(5px)", // Blur all lines except the current line and any previous lines
          userSelect: lineIndex <= currentLine ? "auto" : "none",
        }}
      >
        {line.map((word, wordIndex) => (
          <span
            key={wordIndex}
            style={{
              margin: "5px", // Word spacing
              opacity: lineIndex === currentLine && wordIndex === currentWord ? 1 : textOpacity,
              color: 
                lineIndex === currentLine && wordIndex === currentWord
                  ? backgroundColourSelection !== 1 && backgroundColourSelection !== 5 ? "black" : invertTextColour ? "yellow" : "black"
                  : invertTextColour ? "white" : `rgba(${backgroundColour[0]}, ${backgroundColour[1]}, ${backgroundColour[2]})`,
              fontWeight:
                lineIndex === currentLine && wordIndex === currentWord
                  ? "bold"
                  : "normal", // bolden text of current word
            }}
          >
            {/* Add spacing between each word and line */}
            {word}
            {wordIndex < line.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    ));
  };

  return (
    <Box style={{marginTop: "15vh", justifyContent: "center"}}>
      <video ref={videoRef} autoPlay width="700" height="700" style={{display: 'none'}}></video>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row"}}>
        <Typography
          sx={{
            width: "95vw",
            height: "85vh",
            minWidth: "95vw",
            minHeight: "85vh",
            overflowY: "scroll",
            border: "1px solid #ccc",
            backgroundColor: `rgba(${backgroundColour[0]}, ${backgroundColour[1]}, ${backgroundColour[2]}, ${backgroundBrightness})`, // extract this out to a variable, which changes based on what colour scheme is chosen
            fontSize: `${fontSize}px`, // can be adjusted
            lineHeight: lineSpacing,
            fontFamily: fontStyle,
            letterSpacing: letterSpacing
          }}
        >
          {getFormattedText()} {/* Shows parsed text from uploaded file - speed reading mode*/}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "85vh", ml: "10px", backgroundColor: "white", mt: "-10vh", mr: open ? "2vw" : 0}}>
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

          {/* TEMPORARY: to upload document - to be replaced with text reading modes */}
          <Container>
            <Typography variant="h6" sx={{mt: "2vh"}}>Upload document (TEMPORARY)</Typography>
            <Typography variant="h7" sx={{mt: "2vh", mb: "2vh"}}>Accepted file types: .pdf, .docx, .txt</Typography>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload}/>
            <Divider sx={{width: "80%", mt: "2vh"}}/>
          </Container>

          {/* Text layout settings */}
          <Container>
            <Typography variant="h6" sx={{mt: "2vh"}}>Text Layout</Typography>

            <Container sx={{display: "flex", flexDirection: "row", mt: "2vh", alignItems: "center"}}>
              <Box sx={{ display: "flex", flexDirection: "column", width: '100%'}}>
                <Typography variant="caption">
                  Font Style
                </Typography>
                <FormControl variant="outlined" fullWidth>
                  <Select
                    value={fontStyle}
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
                  value={typeof fontSize === 'number' ? fontSize : 28}
                  onChange={handleFontSize}
                  min={8}
                  max={100}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {fontSize}
              </Typography>
            </Container>

            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <OpacityIcon sx={{fontSize: "30px", mr: "2vw"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Text Opacity
                </Typography>
                <Slider
                  value={typeof textOpacity === 'number' ? textOpacity : 1}
                  onChange={handleTextOpacity}
                  min={0}
                  step={0.1}
                  max={1}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {textOpacity*100}
              </Typography>
            </Container>

            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <FormatLineSpacingRoundedIcon sx={{fontSize: "30px", mr: "2vw", transform: "rotate(270deg)"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Letter Spacing
                </Typography>
                <Slider
                  value={typeof letterSpacing === 'number' ? letterSpacing : 2}
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
                {letterSpacing*10}
              </Typography>
            </Container>

            <Container sx={{display: "flex", flexDirection: "row", mt: "4vh", alignItems: "center"}}>
              <FormatLineSpacingRoundedIcon sx={{fontSize: "30px", mr: "2vw"}}/>
              <Box sx={{ display: "flex", flexDirection: "column", mr: "2vw" }}>
                <Typography variant="caption">
                  Line Spacing
                </Typography>
                <Slider
                  value={typeof lineSpacing === 'number' ? lineSpacing : 2}
                  onChange={handleLineSpacing}
                  min={1}
                  max={10}
                  sx={{ width: "15vw" }}
                />
              </Box>
              <Typography variant="h7"
                sx={{width: "3vw", userSelect: "none", backgroundColor: "#D9D9D9", borderRadius: "5px", textAlign: "center", padding: "5px"}}
              >
                {lineSpacing*10}
              </Typography>
            </Container>
            <Divider sx={{width: "80%", mt: "2vh"}}/>
          </Container>

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
                  value={typeof backgroundBrightness === 'number' ? backgroundBrightness : 1}
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
                {backgroundBrightness*100}
              </Typography>
            </Container>

            <Container sx={{display: "flex", flexDirection: "column", mt: "2vh", alignItems: "center"}}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" sx={{mt: "2vh", mb: "2vh"}}>
                  Colour scheme
                </Typography>
                <Grid2 container spacing={4} justifyContent="center" width="100%">
                  <Grid2 item xs={4}>
                    <Tooltip title="Monochrome" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(1)} onClick={() => handleBackgroundColour(1)}><Box sx={colourSchemeButton("black")}><SubjectIcon sx={colourSchemeIconColour("black")}></SubjectIcon></Box></Button> {/* White - default */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Green" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(2)} onClick={() => handleBackgroundColour(2)}><Box sx={colourSchemeButton("rgb(6,118,3)")}><SubjectIcon sx={colourSchemeIconColour("rgb(6,118,3)")}></SubjectIcon></Box></Button> {/* Green */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Blue" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(3)} onClick={() => handleBackgroundColour(3)}><Box sx={colourSchemeButton("rgb(0,123,229)")}><SubjectIcon sx={colourSchemeIconColour("rgb(0,123,229)")}></SubjectIcon></Box></Button> {/* Blue */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Red" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(4)} onClick={() => handleBackgroundColour(4)}><Box sx={colourSchemeButton("rgb(211,46,63)")}><SubjectIcon sx={colourSchemeIconColour("rgb(221,46,63)")}></SubjectIcon></Box></Button> {/* Red */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Brown" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(5)} onClick={() => handleBackgroundColour(5)}><Box sx={colourSchemeButton("rgb(78,53,22)")}><SubjectIcon sx={colourSchemeIconColour("rgb(78,53,22)")}></SubjectIcon></Box></Button> {/* Brown */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Yellow" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(6)} onClick={() => handleBackgroundColour(6)}><Box sx={colourSchemeButton("rgb(251,192,45)")}><SubjectIcon sx={colourSchemeIconColour("rgb(251,192,45)")}></SubjectIcon></Box></Button> {/* Yellow */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Orange" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(7)} onClick={() => handleBackgroundColour(7)}><Box sx={colourSchemeButton("rgb(245,124,0)")}><SubjectIcon sx={colourSchemeIconColour("rgb(245,124,0)")}></SubjectIcon></Box></Button> {/* Orange */}
                    </Tooltip>
                  </Grid2>
                  <Grid2 item xs={4}>
                    <Tooltip title="Purple" placement="top">
                      <Button variant="outlined" sx={colourSchemeSelection(8)} onClick={() => handleBackgroundColour(8)}><Box sx={colourSchemeButton("rgb(142,36,170)")}><SubjectIcon sx={colourSchemeIconColour("rgb(142,36,170)")}></SubjectIcon></Box></Button> {/* Purple */}
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
