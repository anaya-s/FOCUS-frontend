import { React, useEffect, useState } from "react";

import { reauthenticatingFetch } from "../utils/api";

// import { handlePdfFile, handleDocxFile, handleTxtFile } from "./textParsing";

import { Typography } from "@mui/material";

let startSpeedReading, sendReadingProgress;

export function SpeedReading({textSettings}) {

  const [fontStyle, fontSize, textOpacity, letterSpacing, lineSpacing, backgroundBrightness, invertTextColour, backgroundColour, backgroundColourSelection, highlightSpeed, pauseStatus, resetStatus, documentName, parsedText] = textSettings.current;
  
  /* Text settings states */
  const [backgroundColourState, setBackgroundColourState] = useState(backgroundColour);
  const [backgroundBrightnessState, setBackgroundBrightnessState] = useState(backgroundBrightness);
  const [fontStyleState, setFontStyleState] = useState(fontStyle);
  const [fontSizeState, setFontSizeState] = useState(fontSize);
  const [textOpacityState, setTextOpacityState] = useState(textOpacity);
  const [letterSpacingState, setLetterSpacingState] = useState(letterSpacing);
  const [lineSpacingState, setLineSpacingState] = useState(lineSpacing);
  const [invertTextColourState, setInvertTextColourState] = useState(invertTextColour);
  const [backgroundColourSelectionState, setBackgroundColourSelectionState] = useState(backgroundColourSelection);
  const [highlightSpeedState, setHighlightSpeedState] = useState(highlightSpeed);
  const [pauseStatusState, setPauseStatusState] = useState(pauseStatus);
  const [resetStatusState, setResetStatusState] = useState(resetStatus);
  const [documentNameState, setDocumentNameState] = useState(documentName);
  const [parsedTextState, setParsedTextState] = useState(parsedText);
  

  /* File handling */
  const [textArray, setTextArray] = useState([]); // Stores 2D array of text (lines and words)

  const [currentLine, setCurrentLine] = useState(0); // Stores index of current line
  const [currentWord, setCurrentWord] = useState(0); // Stores index of current word

  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (parsedText.current) {
      startSpeedReading(documentName.current, parsedText.current);
    }
  }, [parsedText]);

  useEffect(() => {
    if(resetStatus === true)
    {
      pauseStatus.current = true;
      setCurrentLine(0);
      setCurrentWord(0);
      resetStatus.current = false;
    }
  }, [resetStatus]);

  sendReadingProgress = async () => {
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

/* Function that iterates through each element in 2D array (every word in every line) */
const iterateWords = async (lines) => {
  if (lines.length) {
    for (let lineNo = currentLine; lineNo < lines.length; lineNo++) {
      for (
        let wordNo = currentWord;
        wordNo < lines[lineNo].length;
        wordNo++
      ) {

        if (pauseStatus.current) {
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (resetStatus.current) {
                setCurrentLine(0);
                setCurrentWord(0);
                resetStatus.current = false;
                lineNo = 0;
                wordNo = 0;
              }
              if (!pauseStatus.current) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        }
        setCurrentLine(lineNo);
        setCurrentWord(wordNo);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 / highlightSpeed.current)
        ); // set time interval
      }
    }
  }
};

  /* Function which handles the uploading of files, detecting whether the file types are valid */
  startSpeedReading = async (fileName, text) => {
    setFileName(fileName);
    setTextArray(text);
    iterateWords(text); // run this if speed reading mode is enabled
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
              opacity:
                lineIndex === currentLine && wordIndex === currentWord
                  ? 1
                  : textOpacity.current,
              color:
                lineIndex === currentLine && wordIndex === currentWord
                  ? backgroundColourSelection.current !== 1 &&
                    backgroundColourSelection.current !== 5
                    ? "black"
                    : invertTextColour.current
                    ? "yellow"
                    : "black"
                  : invertTextColour.current
                  ? "white"
                  : `rgba(${backgroundColour.current[0]}, ${backgroundColour.current[1]}, ${backgroundColour.current[2]})`,
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
    <Typography
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
            letterSpacing: letterSpacing.current
        }}
        >
            {getFormattedText()} {/* Shows parsed text from uploaded file - speed reading mode*/}
        </Typography>
    );
}

export { sendReadingProgress };
