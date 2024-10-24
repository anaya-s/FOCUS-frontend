import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  height: "100vh",
};

const buttonStyle = {
    borderRadius: "17px",
}
const PageFour = () => {
  return (
    <div style={pageStyle}>
      <Typography>smart breaks</Typography>
      <Typography>Stay on top with your progress</Typography>
      <Typography>
        Access your own personalised dashboard with Felix. Felix ensures
        productivity by encouraging the 20-20-20 rule, helping prevent eye
        fatigue with regular breaks.
      </Typography>
        <Button 
        style = {buttonStyle}
        variant="contained"
        color="primary"
        >
            Get Started 
        </Button>
    </div>
  );
};

export default PageFour;
