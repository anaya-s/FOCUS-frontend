import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
  width: "100px",
  height: "auto",
};

const speechBubbleStyle = {
  backgroundColor: "#f5f5f5",
  border: "2px solid black",
  borderRadius: "15px",
  padding: "15px",
  position: "relative",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  flex: 1,
};

const speechBubbleArrowStyle = {
  content: '""',
  position: "absolute",
  left: "-17px",
  top: "20px",
  width: "0",
  height: "0",
  borderLeft: "17px solid transparent",
  borderRight: "17px solid transparent",
  borderTop: "17px solid black",
  zIndex: "-1",
};

const speechBubbleArrowInnerStyle = {
  content: '""',
  position: "absolute",
  left: "-15px",
  top: "22px",
  width: "0",
  height: "0",
  borderLeft: "15px solid transparent",
  borderRight: "15px solid transparent",
  borderTop: "15px solid #f5f5f5",
};

const buttonStyle = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "15px 20px",
  fontSize: "18px",
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: "bold",
  marginBottom: "10px", // Add spacing between buttons
  width: "100%",
};

const progressBarStyle = {
  width: "70%",
  marginTop: "100px",
};

const PageTwo = ({ updateData }) => {
  const [dob, setDob] = useState("");

  const handleSubmit = () => {
    // Update the data in the parent component
    updateData({ dob });
    // Proceed to the next step (if applicable)
    console.log("User's date of birth:", dob);
  };

  return (
    <Box style={pageStyle}>
      <div style={contentStyle}>
        {/* Top Row: Felix image and speech bubble */}
        <div style={topRowStyle}>
          <div style={imageContainerStyle}>
            <img
              src="/images/homepage/felix_done.png"
              alt="Felix the productivity robot"
              style={imageStyle}
            />
          </div>
          <div style={speechBubbleStyle}>
            <Typography variant="h6" component="p" style={{ margin: 0 }}>
              When were you born?
            </Typography>
            <div style={speechBubbleArrowStyle}></div>
            <div style={speechBubbleArrowInnerStyle}></div>
          </div>
        </div>

        {/* Input field for date of birth */}
        <TextField
          label="Date of Birth"
          type="date"
          variant="outlined"
          fullWidth
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Submit button */}
        <Button
          variant="contained"
          style={buttonStyle}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
      
      <LinearProgress variant="determinate" value={40} style={progressBarStyle} />
    </Box>
  );
};

export default PageTwo;