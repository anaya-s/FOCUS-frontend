import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  display: "flex",
  alignItems: "center",    // Centers content vertically
  justifyContent: "center", // Centers content horizontally
  height: "100vh",
  gap: "20px", // Adds space between the text content and the image
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", 
  textAlign: "center",
  gap: "15px", 
};

const imageStyle = {
  width: "225px",
  height: "225px",
};

const PageOne = () => {
  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <Typography variant="h3">Unlock your potential with FOCUS</Typography>
        <Typography variant="h4">
          Enhance Reading and Boost Productivity
        </Typography>
        <Button variant="contained" color="primary">
          FIND OUT MORE
        </Button>
        <Button variant="text">CREATE AN ACCOUNT</Button>
      </div>
      <div>
        <img
          src="/images/felix.png"
          alt="Felix the productivity robot"
          style={imageStyle}
        />
      </div>
    </div>
  );
};

export default PageOne;
