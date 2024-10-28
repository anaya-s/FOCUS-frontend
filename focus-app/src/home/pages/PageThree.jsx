import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  display: "flex",
  alignItems: "center", // Vertically centers content within the page
  justifyContent: "center", // Horizontally centers content within the page
  height: "100vh",
  padding: "0 20px", // Adds padding for small screens
};

const leftColumnStyle = {
  flex: "1", // Takes up half the available width
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", // Centers content vertically within the column
  textAlign: "left", // Left-aligns text
  paddingRight: "20px", // Adds padding between columns
};

const rightColumnStyle = {
  flex: "1", // Takes up half the available width
  display: "flex",
  justifyContent: "center", // Centers image horizontally within the right column
  alignItems: "center", // Centers image vertically within the right column
};

const buttonStyle = {
  borderRadius: "17px",
  marginTop: "20px", // Adds spacing above the button
};

const imageStyle = {
  width: "250px", // Set width of the image
  height: "auto", // Maintain aspect ratio
};

const PageThree = () => {
  return (
    <div style={pageStyle}>
      <div style={leftColumnStyle}>
        <Typography variant="h3">Reading Made Easy</Typography>
        <Typography variant="h2">Elevate your reading experience</Typography>
        <Typography variant="body1">
          Say goodbye to fatigue while reading your documents. Elevate your
          experience with smart highlighting and assistive tools for effortless
          reading.
        </Typography>
        <Button style={buttonStyle} variant="contained" color="primary">
          Get Started
        </Button>
      </div>
      <div style={rightColumnStyle}>
        <img
          src="/images/pdf_upload" //SORT PDF UPLOAD STUFF ASAP
          alt="Reading experience"
          style={imageStyle}
        />
      </div>
    </div>
  );
};

export default PageThree;
