import { React, useEffect, useState, useRef } from "react";
import { Typography, Box } from "@mui/material";
import nlp from "compromise";

let startNLP;

export function NLP({ textSettings }) {
  const [fontStyle, fontSize, textOpacity, letterSpacing, lineSpacing, backgroundBrightness, invertTextColour, backgroundColour, backgroundColourSelection, highlightSpeed, pauseStatus, resetStatus, documentName, parsedText] = textSettings.current;

  const [textArray, setTextArray] = useState([]); // Stores 2D array of text (lines and words)
  const [currentLine, setCurrentLine] = useState(0); // Stores index of current line
  const [currentWord, setCurrentWord] = useState(0); // Stores index of current word
  const [fileName, setFileName] = useState("");
  const significantWords = useRef(new Set());
  const isNotValid = useRef(false);

  useEffect(() => {
    if (parsedText.current) {
      startNLP(documentName.current, parsedText.current);
    }
  }, [parsedText]);

  useEffect(() => {
    if (resetStatus.current === true) {
      setCurrentWord(0);
      setCurrentLine(0);
      resetStatus.current = false;
    }
  }, [resetStatus.current]);

  useEffect(() => {
    if (pauseStatus.current === false) {
      iterateWords(textArray);
    }
  }, [pauseStatus.current]);

  /* Function that iterates through each element in 2D array (every word in every line) */
  const iterateWords = async (lines) => {
    if (lines.length) {
      for (let lineNo = currentLine; lineNo < lines.length; lineNo++) {
        for (let wordNo = currentWord; wordNo < lines[lineNo].length; wordNo++) {
          if (pauseStatus.current) {
            break;
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
  startNLP = async (fileName, text) => {
    setFileName(fileName);
    setTextArray(parsedText.current);
    if(textArray.length === 0)
      isNotValid.current = true;
    pauseStatus.current = true;
    // console.log(text.flat().join(" "));
    significantWords.current = extractImportantWords(text.flat().join(" "));
  };

  const extractImportantWords = (text) => {
    let doc = nlp(text);
    let words = new Set(doc.nouns().text().split(" "));
    // console.log(words);
    return words;
  };

  const getFormattedText = () => {
    return textArray.map((line, lineIndex) => (
      <div
        key={lineIndex}
      >
        {line.map((word, wordIndex) => {
          const isSignificant = significantWords.current.has(word);
          return (
            <span
              key={wordIndex}
              style={{
                margin: "5px",
                opacity:
                  isSignificant
                    ? 1
                    : textOpacity.current,
                color: isSignificant
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
                  isSignificant
                    ? "bold"
                    : "normal",
              }}
            >
              {word}
              {wordIndex < line.length - 1 ? " " : ""}
            </span>
          );
        })}
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
        backgroundColor: `rgba(${backgroundColour.current[0]}, ${backgroundColour.current[1]}, ${backgroundColour.current[2]}, ${backgroundBrightness.current})`,
        fontSize: textArray.length !== 0 ? `${fontSize.current}px` : 'initial',
        lineHeight: textArray.length !== 0 ? lineSpacing.current : 'initial',
        fontFamily: textArray.length !== 0 ? fontStyle.current : 'initial',
        letterSpacing: textArray.length !== 0 ? letterSpacing.current : 'initial'
      }}
    >
      {textArray.length === 0 && isNotValid.current === true ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: "white",
            height: "auto",
            padding: "2vh",
            borderRadius: "5px",
            border: "1px solid #06760D",
            margin: "2vh",
            lineHeight: "normal",
            fontFamily: 'Istok Web, sans-serif'
          }}
        >
          <Typography variant="h3" sx={{ marginBottom: "2vh", marginTop: "5vh" }}>
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
            Please try Reading Mode 1 or try uploading another document.
          </Typography>
        </Box>
      ) : (
        getFormattedText()
      )}
    </Typography>
  );
}