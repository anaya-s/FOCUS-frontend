import Typography from "@mui/material/Typography";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", 
  justifyContent: "center", 
  height: "100vh",
  gap: "40px", 
};

const headingStyle = {
  textAlign: "center", 
};

const featureStyle = {
  display: "flex",
  justifyContent: "center", 
  gap: "100px", 
};

const featureItemStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", 
  textAlign: "center", 
};

const imageStyle = {
  width: "130px",
  height: "130px",
};

const PageTwo = () => {
  return (
    <div style={pageStyle}>
      <div style={headingStyle}>
        <Typography variant="h2" fontWeight="bold">
          Stay Sharp, Stay Productive
        </Typography>
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
          <Typography variant="h5" sx={{ fontSize: "40px" }}>
            Real Time
          </Typography>
          <Typography variant="h6" sx={{ color: "gray" }}>
            Use your camera to track eye movements
          </Typography>
        </div>
        <div style={featureItemStyle}>
          <img
            src="/images/fatigue.png"
            alt="Image for fatigue"
            style={imageStyle}
          />
          <Typography variant="h5" sx={{ fontSize: "40px" }}>
            Eye Fatigue
          </Typography>
          <Typography variant="h6" sx={{ color: "gray" }}>
            Monitors eye health with in-house technology
          </Typography>
        </div>
        <div style={featureItemStyle}>
          <img
            src="/images/productive.png"
            alt="Image for improving productivity"
            style={imageStyle}
          />
          <Typography variant="h5" sx={{ fontSize: "40px" }}>
            Be Productive
          </Typography>
          <Typography variant="h6" sx={{ color: "gray" }}>
            Personalised tips to boost productivity
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default PageTwo;