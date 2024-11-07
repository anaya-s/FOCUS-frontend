import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  display: "flex",
  alignItems: "center", // Vertically centers content within the page
  justifyContent: "center", // Horizontally centers content within the page
  height: "100vh",
  marginLeft: "120px",     // Margin on the left
  marginRight: "30px",    // Margin on the right
  padding: "0 20px", // Adds padding for small screens
};

const leftColumnStyle = {
  flex: "1", // Takes up half the available width
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", // Centers content vertically within the column
  textAlign: "left", // Left-aligns text
  paddingRight: "200px", // Adds padding between columns
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
  width: "500px", // Set width of the image
  height: "500px", // Maintain aspect ratio
};

const PageThree = () => {
  return (
    <div style={pageStyle}>
      <div style={leftColumnStyle}>
        <Typography variant="h3" sx={{ fontSize: "30px" }}>Reading Made Easy</Typography>
        <Typography variant="h2" fontWeight="bold">Elevate your reading experience</Typography>
        <Typography variant="body1" sx={{ color: "gray" }}>
          Say goodbye to fatigue while reading your documents. Elevate your
          experience with smart highlighting and assistive tools for effortless
          reading.
        </Typography>
      </div>
      <div style={rightColumnStyle}>
        <img
          src="/images/upload.png" //SORT PDF UPLOAD STUFF ASAP
          alt="Reading experience"
          style={imageStyle}
        />
      </div>
    </div>
  );
};

export default PageThree;
