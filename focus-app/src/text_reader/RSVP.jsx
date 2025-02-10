import React, { useEffect, useState, useRef } from "react";
import { reauthenticatingFetch } from "../utils/api";
import config from '../config'
const baseURL = config.apiUrl

import { Typography, Box, CircularProgress } from "@mui/material";

let startRSVP, sendReadingProgressRSVP;

export function RSVP({ textSettings }) {
  const [fontStyle, fontSize, letterSpacing, lineSpacing, backgroundBrightness, invertTextColour, backgroundColour, backgroundColourSelection, highlightSpeed, wordCount, pauseStatus, resetStatus, documentName, parsedText] = textSettings.current;

  const [textArray, setTextArray] = useState([]); // Stores 2D array of text (lines and words)
  const [currentWord, setCurrentWord] = useState(0); // Stores index of current word
  const [fileName, setFileName] = useState("");
  const isNotValid = useRef(false);
  const resetResolver = useRef(null);

  useEffect(() => {
    if (parsedText.current) {
        startRSVP(documentName.current, parsedText.current);
    }
  }, [parsedText]);

  useEffect(() => {
    if(resetStatus.current === true)
    {
        if (resetResolver.current) {
          resetResolver.current();
        }
        setCurrentWord(0);
        resetStatus.current = false;
    }
  }, [resetStatus.current]);

  useEffect(() => {
    if(pauseStatus.current === false)
    {
      iterateWords(textArray);
    }
  }, [pauseStatus.current]);

  sendReadingProgressRSVP = async () => {
    const bodyContents = { fileName: fileName, lineNumber: currentWord };
    console.log(bodyContents);

    const response = await reauthenticatingFetch(
      "POST",
      `${baseURL}/api/user/reading-progress/`,
      bodyContents
    );

    if (response.error) console.log(response.error);
    else {
      // the response should contain the line number of previous session, if exists, otherwise set current line number to 0
    }
  };

  const iterateWords = async (words) => {
    if (words.length) {
        var currentWordIndex = currentWord;
        while(currentWordIndex < words.length) {
            currentWordIndex = currentWordIndex + wordCount.current;
            if (pauseStatus.current) {
                break;
            }
          setCurrentWord(currentWordIndex);
          await new Promise((resolve) => {
            resetResolver.current = resolve;
            setTimeout(resolve, 5000 / highlightSpeed.current);
          }); // set time interval
        }
    }
  };

  startRSVP = async (fileName, text) => {
    setFileName(fileName);
    setTextArray(text.flat());
    if(textArray.length === 0)
      isNotValid.current = true;
    pauseStatus.current = true;
  };

  const getFormattedText = () => {
  
    var words = "";
    if (currentWord >= textArray.length && textArray.length !== 0)
    {
        words = "End of text.";
        pauseStatus.current = true;
    }
    else
    {
        // Calculate the end index for the words to display
        const endWordIndex = Math.min(currentWord + wordCount.current, textArray.length);
    
        // Get the subset of words to display
        words = textArray.slice(currentWord, endWordIndex).join(" ");
    }

    return (
      <Typography
        sx={{
          fontSize: `${fontSize.current}px`,
          lineHeight: lineSpacing.current,
          fontFamily: fontStyle.current,
          letterSpacing: letterSpacing.current,
          color: (backgroundColourSelection.current === 1 || backgroundColourSelection.current === 5) ? ((invertTextColour.current) ? "yellow" : "black") : ((invertTextColour.current) ? "white" : "black"),
          alignText: "center",
          justifyContent: "center",
          fontStyle: (textArray.length === 0 || currentWord >= textArray.length) ? "italic" : "normal"
        }}
      >
        {words.length === 0 ? <CircularProgress /> : words}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        width: "92vw",
        height: "85vh",
        minWidth: "92vw",
        minHeight: "85vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid #ccc",
        overflow: 'hidden', 
        backgroundColor: `rgba(${backgroundColour.current[0]}, ${backgroundColour.current[1]}, ${backgroundColour.current[2]}, ${backgroundBrightness.current})`
      }}
    >
      {textArray.length === 0 && isNotValid.current === true ? (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{backgroundColor: "white", height: "auto", padding: "2vh", borderRadius: "5px", border: "1px solid #06760D", margin: "2vh"}}>
          <Typography variant="h3" sx={{ marginBottom: "2vh", marginTop: "5vh"}}>No text available to display.</Typography>
          <Typography variant="h7"sx={{ marginBottom: "2vh"}}>This may be the case if your document:</Typography>
          <Typography variant="h6"sx={{ marginBottom: "2vh"}}>• Only contains image/graphics (e.g. handwritten text)</Typography>
          <Typography variant="h6"sx={{ marginBottom: "2vh"}}>• Is an empty document</Typography>
          <Typography variant="h7" sx={{ marginBottom: "2vh" }}>Please try Reading Mode 1 or try uploading another document.</Typography>
        </Box>
      ) : (
        getFormattedText()
      )}
    </Box>
  );
}

export { sendReadingProgressRSVP };