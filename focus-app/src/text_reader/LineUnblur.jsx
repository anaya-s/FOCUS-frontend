import { React, useEffect, useState, useRef } from "react";
import { reauthenticatingFetch } from "../utils/api";
import { Typography, Box } from "@mui/material";

let startLineUnblur, sendReadingProgressLineUnblur;

export function LineUnblur({ textSettings }) {
  const [
    fontStyle,
    fontSize,
    textOpacity,
    letterSpacing,
    lineSpacing,
    backgroundBrightness,
    invertTextColour,
    backgroundColour,
    backgroundColourSelection,
    highlightSpeed,
    yCoord,
    prevLineUnblur,
    autoScroll,
    pauseStatus,
    resetStatus,
    documentName,
    parsedText,
  ] = textSettings.current;

  const [textArray, setTextArray] = useState([]); // Stores 2D array of text (lines and words)
  const [currentLine, setCurrentLine] = useState(0); // Stores index of current line
  const [fileName, setFileName] = useState("");
  const [hoveredLine, setHoveredLine] = useState(null); // Stores index of hovered line

  const typographyRef = useRef(null); // Create a ref for the Typography component
  const lineRefs = useRef([]); // Create refs for each line

  useEffect(() => {
    if (parsedText.current) {
      startLineUnblur(documentName.current, parsedText.current);
    }
  }, [parsedText]);

  sendReadingProgressLineUnblur = async () => {
    const bodyContents = { fileName: fileName, lineNumber: currentLine };
    console.log(bodyContents);

    const response = await reauthenticatingFetch(
      "POST",
      `http://localhost:8000/api/user/reading-progress/`,
      bodyContents
    );

    if (response.error) console.log(response.error);
    else {
      // the response should contain the line number of previous session, if exists, otherwise set current line number to 0
    }
  };

  /* Function which handles the uploading of files, detecting whether the file types are valid */
  startLineUnblur = async (fileName, text) => {
    setFileName(fileName);
    setTextArray(text);
  };

  /* Function to calculate the hovered line based on y-coordinate */
  const calculateHoveredLine = () => {
    if (lineRefs.current.length === 0) return;

    const y = yCoord.current;
    for (let i = 0; i < lineRefs.current.length; i++) {
      const lineElement = lineRefs.current[i];
      if (lineElement) {
        const rect = lineElement.getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom) {
          setHoveredLine(i);
          break;
        }
      }
    }
  };

  /* Initialize WebGazer and track gaze coordinates */
  useEffect(() => {
    calculateHoveredLine();

    if(autoScroll.current) {
    // Auto-scroll when yCoord is at the bottom
      const typographyElement = typographyRef.current;
      if (typographyElement) {
        const rect = typographyElement.getBoundingClientRect();
        if (yCoord.current >= rect.bottom - 250) { // Adjust the threshold as needed
          const scrollInterval = setInterval(() => {
            typographyElement.scrollBy({
              top: 1,
              behavior: "auto",
            });
          }, 100);

          // Clear interval after a short duration to stop continuous scrolling
          setTimeout(() => {
            clearInterval(scrollInterval);
          }, 500); // Adjust the duration as needed
        }
      }
    }
  }, [yCoord.current, textArray.length]);

  /* Function which manages the highlighting of words whilst reading - for speed reading mode */
  const getFormattedText = () => {
    return textArray.map((line, lineIndex) => (
      <div
        key={lineIndex}
        ref={(el) => (lineRefs.current[lineIndex] = el)} // Attach refs to each line
        style={{
          filter: (prevLineUnblur.current ? lineIndex <= hoveredLine : lineIndex === hoveredLine) ? "none" : "blur(5px)", // Blur all lines except the current line and any previous lines
          opacity:
          lineIndex === hoveredLine
            ? 1
            : textOpacity.current,
            color:
            lineIndex === hoveredLine
              ? backgroundColourSelection.current !== 1 &&
                backgroundColourSelection.current !== 5
                ? "black"
                : invertTextColour.current
                ? "yellow"
                : "black"
              : invertTextColour.current
              ? "white"
              : `rgba(${backgroundColour.current[0]}, ${backgroundColour.current[1]}, ${backgroundColour.current[2]})`,
          fontWeight: lineIndex === hoveredLine ? "bold" : "normal", // Bold the current line
          display: "flex", // Display as flex to keep words in a row
        }}
      >
        {line.map((word, wordIndex) => (
          <span
            key={wordIndex}
            style={{
              margin: "5px", // Word spacing
            }}
          >
            {word}
            {wordIndex < line.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    ));
  };

  return (
    <Typography
      ref={typographyRef} // Attach the ref to the Typography component
      sx={{
        width: "92vw",
        height: "85vh",
        minWidth: "92vw",
        minHeight: "85vh",
        overflowY: "scroll",
        border: "1px solid #ccc",
        backgroundColor: `rgba(${backgroundColour.current[0]}, ${backgroundColour.current[1]}, ${backgroundColour.current[2]}, ${backgroundBrightness.current})`, // extract this out to a variable, which changes based on what colour scheme is chosen
        fontSize: `${fontSize.current}px`, // can be adjusted
        lineHeight: lineSpacing.current,
        fontFamily: fontStyle.current,
        letterSpacing: letterSpacing.current,
      }}
    >
      {textArray.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h3"
            sx={{ marginBottom: "2vh", marginTop: "5vh" }}
          >
            No text available to display.
          </Typography>
          <Typography variant="h7" sx={{ marginBottom: "2vh" }}>
            This may be the case if your document:
          </Typography>
          <Typography variant="h6" sx={{ marginBottom: "2vh" }}>
            • Only contains image/graphics (e.g. handwritten text)
          </Typography>
          <Typography variant="h6" sx={{ marginBottom: "2vh" }}>
            • Is an empty document
          </Typography>
          <Typography variant="h7" sx={{ marginBottom: "2vh" }}>
            Please try another reading mode.
          </Typography>
        </Box>
      ) : (
        getFormattedText()
      )}
    </Typography>
  );
}

export { sendReadingProgressLineUnblur };