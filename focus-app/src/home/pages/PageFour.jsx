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
  justifyContent: "center", // Centers image horizontally within the left column
};

const rightColumnStyle = {
  flex: "1", // Takes up half the available width
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", // Centers content vertically within the column
  textAlign: "left", // Left-aligns text
  paddingLeft: "20px", // Adds padding between columns
};

const buttonStyle = {
  borderRadius: "17px",
  marginTop: "20px", // Adds spacing above the button
};

const imageStyle = {
  width: "250px", // Set width of the image
  height: "auto", // Maintain aspect ratio
};

const PageFour = () => {
  return (
    <div style={pageStyle}>
      <div style={leftColumnStyle}>
        <img
          src="/images/felix.png" // TEMP ROBOT IMAGE 
          alt="Felix the productivity robot"
          style={imageStyle}
        />
      </div>
      <div style={rightColumnStyle}>
        <Typography variant="h3">Smart Breaks</Typography>
        <Typography variant="h2">Stay on top with your progress</Typography>
        <Typography variant="body1">
          Access your own personalised dashboard with Felix. Felix ensures
          productivity by encouraging the 20-20-20 rule, helping prevent eye
          fatigue with regular breaks.
        </Typography>
        <Button style={buttonStyle} variant="contained" color="primary">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default PageFour;
