import React from "react";
import Typography from "@mui/material/Typography";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Centers everything horizontally
  justifyContent: "center", // Centers everything vertically
  height: "100vh",
  gap: "40px", // Space between heading section and feature section
};

const headingStyle = {
  textAlign: "center", // Centers the heading text
};

const featureStyle = {
  display: "flex",
  justifyContent: "center", // Centers the feature items horizontally
  gap: "100px", // Space between each feature item
};

const featureItemStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Centers text and image within each feature item
  textAlign: "center", // Centers the text under each image
  maxWidth: "200px", // Optional: Limits the width of each feature item
};

const imageStyle = {
  width: "130px",
  height: "130px",
};

const PageTwo = () => {
  return (
    <div style={pageStyle}>
      <div style={headingStyle}>
        <Typography variant="h2">Stay Sharp, Stay Productive</Typography>
        <Typography variant="h4">
          60% of people suffer from digital eye strain 
        </Typography>
      </div>
      <div style={featureStyle}>
        <div style={featureItemStyle}>
          <img
            src="/images/eye.png"
            alt="Image for eye tracking"
            style={imageStyle}
          />
          <Typography variant="h5">Real Time</Typography>
          <Typography variant="h6">Use your camera to track eye movements</Typography>
        </div>
        <div style={featureItemStyle}>
          <img
            src="/images/fatigue.png"
            alt="Image for fatigue"
            style={imageStyle}
          />
          <Typography variant="h5">Eye Fatigue</Typography>
          <Typography variant="h6">Monitors eye health with in-house technology</Typography>
        </div>
        <div style={featureItemStyle}>
          <img
            src="/images/productive.png"
            alt="Image for improving productivity"
            style={imageStyle}
          />
          <Typography variant="h5">Be Productive</Typography>
          <Typography variant="h6">Personalised tips to boost productivity</Typography>
        </div>
      </div>
    </div>
  );
};

export default PageTwo;
