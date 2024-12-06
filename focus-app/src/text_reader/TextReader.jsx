import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "../utils/navigation";
import webgazer from "../webgazer/webgazer.js";
import * as pdfjsLib from "pdfjs-dist/webpack"; // For parsing .pdf files
import mammoth from "mammoth"; // For parsing .docx files

/* MaterialUI Imports */
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

function TextReaderPage() {
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

  const [fontSize, setFontSize] = useState(28); // Initialize font size

  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

   // Functions to change font size
   const increaseFontSize = () => setFontSize((prevSize) => prevSize + 2); // Increase font size
   const decreaseFontSize = () => setFontSize((prevSize) => Math.max(prevSize - 2, 10)); // Decrease font size, prevent going below 10px

  const intervalRef = useRef(null);

  const { toNotAuthorized } = useNavigation();

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
        webgazer.params.showGazeDot = false;
        webgazer.params.showVideoPreview = false;
        webgazer.params.saveDataAcrossSessions = false;

        await webgazer.begin(false);

        var calibrationData = JSON.parse(localStorage.getItem("calibration"));
        webgazer.setRegressionData(calibrationData);

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

  /* Function which handles the uploading of files, detecting whether the file types are valid */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        // Check for .pdf file type
        await handlePdfFile(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Check for .docx file type
        await handleDocxFile(file);
      } else if (file.type === "text/plain") {
        // Check for .txt file type
        await handleTxtFile(file);
      } else {
        alert("Please upload a valid PDF, DOCX, or TXT file.");
      }
    }
  };

  /* Function which parses the text within PDF files */
  const handlePdfFile = async (file) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      let extractedTextArray = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i); // get current page
        const textContent = await page.getTextContent(); // get all text content

        let currentLineArray = []; // stores list of words
        let lastY = null; // y-coordinate of current line, if it changes from this, it indicates that new line is being parsed

        /* Parse each item in the text contents of the PDF */
        textContent.items.forEach((item) => {
          /* Reset for every new line */
          if (lastY !== null && item.transform[5] !== lastY) {
            extractedTextArray.push(currentLineArray);
            currentLineArray = [];
          }

          /* Split each line into separate words and add it to the line array */
          const words = item.str.trim().split(/\s+/);
          words.forEach((word) => {
            if (word) currentLineArray.push(word);
          });

          lastY = item.transform[5]; // store y-coordinate of current line
        });

        /* Add the last line */
        if (currentLineArray.length > 0)
          extractedTextArray.push(currentLineArray);
      }

      setTextArray(extractedTextArray); // set 2D array (lines, words) to be displayed and highlighted later on
      iterateWords(extractedTextArray); // TEMPORARY: start automatic highlighting of words
    };
    reader.readAsArrayBuffer(file);
  };

  /* Function which parses the text within DOCX files */
  const handleDocxFile = async (file) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const result = await mammoth.extractRawText({ arrayBuffer });

      let extractedTextArray = [];
      result.value.split("\n").forEach((line) => {
        const trimmedLine = line.trim(); // removes any whitespaces and newlines in current line

        /* Ignore lines that are empty or contain only whitespace */
        if (trimmedLine) {
          const words = trimmedLine.split(/\s+/);
          extractedTextArray.push(words);
        }
      });

      setTextArray(extractedTextArray); // set 2D array (lines, words) to be displayed and highlighted later on
      iterateWords(extractedTextArray); // TEMPORARY: start automatic highlighting of words
    };
    reader.readAsArrayBuffer(file);
  };

  /* Function which parses the text within TXT files */
  const handleTxtFile = async (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target.result;
      const extractedTextArray = result
        .split("\n")
        .map((line) => line.trim().split(/\s+/).filter(Boolean)); // split text into lines and words

      setTextArray(extractedTextArray); // set 2D array (lines, words) to be displayed and highlighted later on
      iterateWords(extractedTextArray); // TEMPORARY: start automatic highlighting of words
    };

    reader.readAsText(file); // Read the file as text
  };

  /* TEMPORARY function that iterates through each element in 2D array (every word in every line)*/
  const iterateWords = async (lines) => {
    if (!textArray.length) {
      for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        for (let wordNo = 0; wordNo < lines[lineNo].length; wordNo++) {
          setCurrentLine(lineNo);
          setCurrentWord(wordNo);
          await new Promise((resolve) => setTimeout(resolve, 500)); // set time interval
        }
      }
    }
  };

  /* Function which manages the highlighting of words whilst reading */
  const getFormattedText = () => {
    return textArray.map((line, lineIndex) => (
      <div
        key={lineIndex}
        style={{
          filter: lineIndex <= currentLine ? "none" : "blur(5px)", // Blur all lines except the current line and any previous lines
        }}
      >
        {line.map((word, wordIndex) => (
          <span
            key={wordIndex}
            style={{
              backgroundColor:
                lineIndex === currentLine && wordIndex === currentWord
                  ? "yellow"
                  : "transparent", // highlight current word with yellow background
              margin: "5px", // Word spacing
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
    <Box style={{marginTop: "150px", marginBottom: "120px", justifyContent: "center"}}>
      <video ref={videoRef} autoPlay width="700" height="700" style={{display: 'none'}}></video>
      <Container style={{textAlign: "center"}}>
        <Typography variant="h4">Upload a document to read</Typography>
        <Typography variant="h6">Accepted file types: .pdf, .docx, .txt</Typography>
        <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} style={{border: "1px solid #06760D", borderRadius: "2px", padding: "5px", marginRight: "10px"}}/>
        <Button onClick={increaseFontSize}>Increase Font Size</Button>
        <Button onClick={decreaseFontSize}>Decrease Font Size</Button>
        <Typography variant="h6">Extracted text:</Typography>
      </Container>
      <Typography
        sx={{
          width: "100%",
          height: "500px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
          backgroundColor: "#f9f9f9",
          fontSize: `${fontSize}px`, // can be adjusted
          lineHeight: "2"
        }}
      >
        {getFormattedText()} {/* Shows parsed text from uploaded file*/}
      </Typography>
    </Box>
  );
}

export default TextReaderPage;
