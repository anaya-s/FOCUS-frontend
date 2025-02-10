import { React, useEffect, useState, useRef } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
// import nlp from "compromise";
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

let startNLP;

export function NLP({ textSettings }) {
  const [fontStyle, fontSize, textOpacity, letterSpacing, lineSpacing, backgroundBrightness, invertTextColour, backgroundColour, backgroundColourSelection, showVerbs, showConjucations, documentName, parsedText] = textSettings.current;

  const [textArray, setTextArray] = useState([]); // Stores 2D array of text (lines and words)
  const [currentLine, setCurrentLine] = useState(0); // Stores index of current line
  const [currentWord, setCurrentWord] = useState(0); // Stores index of current word
  const [fileName, setFileName] = useState("");
  const significantNouns = useRef(new Set());
  const significantVerbs = useRef(new Set());
  const significantConjunctions = useRef(new Set());
  const isNotValid = useRef(false);

  useEffect(() => {
    if (parsedText.current) {
      startNLP(documentName.current, parsedText.current);
    }
  }, [parsedText]);

  /* Function which handles the uploading of files, detecting whether the file types are valid */
  startNLP = async (fileName, text) => {
    setFileName(fileName);
    setTextArray(parsedText.current);
    if(textArray.length === 0)
      isNotValid.current = true;
    const result = extractImportantWords(text.flat().join(" "));
    significantNouns.current = result.nouns;
    significantVerbs.current = result.verbs;
    significantConjunctions.current = result.conjunctions;
  };

  const extractImportantWords = (text) => {
      // Using wink-nlp to filter true nouns
      const winkDoc = winkNLP(model);
      const winkText = winkDoc.readDoc(text);

      const its = winkDoc.its;

      const nouns = new Set(winkText.tokens().filter((t) => t.out(its.pos) === 'NOUN' || t.out(its.pos) === 'PROPN' || t.out(its.pos) === 'PRON' || t.out(its.pos) === 'NUM').out());
      const verbs = new Set(winkText.tokens().filter((t) => t.out(its.pos) === 'VERB').out());
      const conjunctions = new Set(winkText.tokens().filter((t) => t.out(its.pos) === 'CCONJ' || t.out(its.pos) === 'SCONJ').out());

      // console.log(nouns);
      // console.log(verbs);
      // console.log(conjunctions);

      return {nouns, verbs, conjunctions};

    };
    

  const getFormattedText = () => {

    return textArray.map((line, lineIndex) => (
      <div
        key={lineIndex}
      >
        {line.map((word, wordIndex) => {

          const cleanWord = word.replace(/[.,]+$/g, "").trim(); // remove trailing full stops and commas

          const isNoun = significantNouns.current.has(cleanWord);
          const isVerb = (showVerbs.current) ? significantVerbs.current.has(cleanWord) : false;
          const isConjucation = (showConjucations.current) ? significantConjunctions.current.has(cleanWord) : false;

          return (
            <span
              key={wordIndex}
              style={{
                margin: "5px",
                opacity:
                  (isNoun || isVerb || isConjucation)
                    ? 1
                    : textOpacity.current,
                color: (isNoun || isVerb || isConjucation)
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
                  isNoun
                    ? "bold"
                    : "normal",
                fontStyle: (isVerb) ? "italic" : "normal",
                textDecoration: (isConjucation) ? "underline" : "none"
              }}
            >
              {word}
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
        textArray.length === 0 ? <CircularProgress/> :
        getFormattedText()
      )}
    </Typography>
  );
}