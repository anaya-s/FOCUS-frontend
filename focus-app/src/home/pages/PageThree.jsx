import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Centers content horizontally
  justifyContent: "center", // Centers content vertically
  height: "100vh",
  textAlign: "center", // Centers text within each Typography component
  padding: "0 20px", // Optional: Adds padding for small screens
};

const buttonStyle = {
  borderRadius: "17px",
  marginTop: "20px", // Adds spacing above the button
};

const PageThree = () => {
  return (
    <div style={pageStyle}>
      <Typography variant="h4">Reading Made Easy</Typography>
      <Typography variant="h6">Elevate your reading experience</Typography>
      <Typography variant="body1">
        Say goodbye to fatigue while reading your documents. Elevate your
        experience with smart highlighting and assistive tools for effortless
        reading.
      </Typography>
      <Button style={buttonStyle} variant="contained" color="primary">
        Get Started
      </Button>
    </div>
  );
};

export default PageThree;
