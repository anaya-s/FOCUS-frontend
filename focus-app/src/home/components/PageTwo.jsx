import React from "react";
import Typography from "@mui/material/Typography";

const pageStyle = {
   // display: 'flex',
   // flexDirection: 'column',
}

const headingStyle = {
//    margin : '10px 50px 50px 10px',
// display: 'flex',
// // flexDirection: 'row',
//  alignItems: 'center',
//  justifyContent: 'center',
}
const featureStyle = {
    display:  'flex',
    // flexDirection: 'column',
}

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
        <div>
          <img
            src="/images/eye.png"
            alt="Image for eye tracking"
            //   style={imageStyle}
          />
          <Typography>Real Time</Typography>
          <Typography>Use your camera to track eye movements</Typography>
        </div>
        <div>
          <img
            src="/images/fatigue.png"
            alt="Image for fatigue"
            //   style={imageStyle}
          />
          <Typography>Eye Fatigue</Typography>
          <Typography>Monitors eye health with in-house technology</Typography>
        </div>
        <div>
          <img
            src="/images/productive.png"
            alt="Image for improving productivity"
            //   style={imageStyle}
          />
          <Typography>Be Productive</Typography>
          <Typography>Personalised tips to boost productivity</Typography>
        </div>
      </div>
    </div>
  );
};

export default PageTwo;
