import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100vh",
  padding: "20px",
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "75%", // Central column width set to half the page
  maxWidth: "600px",
};

const topRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "20px",
  width: "100%",
};

const imageContainerStyle = {
  flexShrink: 0,
};

const imageStyle = {
  width: "750px",
  height: "auto",
};


const TEMP = () => {
  return (
    <Box style={pageStyle}>
      <div style={contentStyle}>
        {/* Top Row: Felix image and speech bubble */}
          <div style={imageContainerStyle}>
            <img
              src="/images/homepage/upload.png"
              alt="Felix the productivity robot"
              style={imageStyle}
            />
          </div>
      </div>
    </Box>
  );
};

export default TEMP;
