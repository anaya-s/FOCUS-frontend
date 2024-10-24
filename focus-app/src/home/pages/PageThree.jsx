import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  height: "100vh",
};

const buttonStyle = {
  borderRadius: "17px",
};

const PageThree = () => {
  return (
    <div style={pageStyle}>
      <Typography>reading made easy</Typography>
      <Typography>Elevate your reading experience</Typography>
      <Typography>
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
