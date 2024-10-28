import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Centers items horizontally
  justifyContent: "center", // Centers items vertically
  height: "100vh",
  textAlign: "center", // Centers text within each Typography component
  padding: "0 20px", // Optional: Adds padding for small screens
};

const buttonStyle = {
  borderRadius: "17px",
  marginTop: "20px", // Adds spacing above the button
};

const PageFour = () => {
  return (
    <div style={pageStyle}>
      <Typography variant="h4">Smart Breaks</Typography>
      <Typography variant="h6">Stay on top with your progress</Typography>
      <Typography variant="body1">
        Access your own personalised dashboard with Felix. Felix ensures
        productivity by encouraging the 20-20-20 rule, helping prevent eye
        fatigue with regular breaks.
      </Typography>
      <Button style={buttonStyle} variant="contained" color="primary">
        Get Started
      </Button>
    </div>
  );
};

export default PageFour;
