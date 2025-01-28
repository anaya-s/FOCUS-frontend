import React, { useEffect, useState } from "react";
import { reauthenticatingFetch } from "../utils/api";
import { Typography, Box, Button } from "@mui/material";

let startRSVP, sendReadingProgressRSVP;

export function RSVP({ textSettings }) {
  const [fontStyle, fontSize, letterSpacing, lineSpacing, backgroundBrightness, invertTextColour, backgroundColour, backgroundColourSelection, highlightSpeed, wordCount, pauseStatus, resetStatus, documentName, parsedText] = textSettings.current;

  const [textArray, setTextArray] = useState([]); // Stores 2D array of text (lines and words)
  const [currentWord, setCurrentWord] = useState(0); // Stores index of current word
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (parsedText.current) {
        startRSVP(documentName.current, parsedText.current);
    }
  }, [parsedText]);

  useEffect(() => {
    if(resetStatus.current === true)
    {
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
      `http://localhost:8000/api/user/reading-progress/`,
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
          await new Promise((resolve) =>
            setTimeout(resolve, 5000 / highlightSpeed.current)
          ); // set time interval
        }
    }
  };

  startRSVP = async (fileName, text) => {
    setFileName(fileName);
    setTextArray(text.flat());
    pauseStatus.current = true;
  };

  const getFormattedText = () => {
  
    var words = "";
    if (textArray.length === 0 || currentWord >= textArray.length)
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
        {words}
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
      {textArray.length === 0 ? (
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" sx={{ marginBottom: "2vh", marginTop: "5vh"}}>No text available to display.</Typography>
          <Typography variant="h7"sx={{ marginBottom: "2vh"}}>This may be the case if your document:</Typography>
          <Typography variant="h6"sx={{ marginBottom: "2vh"}}>• Only contains image/graphics (e.g. handwritten text)</Typography>
          <Typography variant="h6"sx={{ marginBottom: "2vh"}}>• Is an empty document</Typography>
          <Typography variant="h7"sx={{ marginBottom: "2vh"}}>Please try another reading mode.</Typography>
        </Box>
      ) : (
        getFormattedText()
      )}
    </Box>
  );
}

export { sendReadingProgressRSVP };