import Typography from "@mui/material/Typography";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", 
  justifyContent: "center", 
  height: "75vh",
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
          60% of people suffer from digital eye strain - we're here to help
        </Typography>
      </div>
      <div style={featureStyle}>
        <div style={featureItemStyle}>
          <img
            src="/images/homepage/eye.png"
            alt="Image for eye tracking"
            style={imageStyle}
          />
          <Typography variant="h5" sx={{ fontSize: "40px" }}>
            Real Time
          </Typography>
          <Typography variant="h6" sx={{ color: "gray" }}>
            Use your camera to track eye movements while you read
          </Typography>
        </div>
        <div style={featureItemStyle}>
          <img
            src="/images/homepage/fatigue.png"
            alt="Image for fatigue"
            style={imageStyle}
          />
          <Typography variant="h5" sx={{ fontSize: "40px" }}>
            Eye Fatigue
          </Typography>
          <Typography variant="h6" sx={{ color: "gray" }}>
            Let us reduce your eye fatigue levels with reminders to take breaks
          </Typography>
        </div>
        <div style={featureItemStyle}>
          <img
            src="/images/homepage/productive.png"
            alt="Image for improving productivity"
            style={imageStyle}
          />
          <Typography variant="h5" sx={{ fontSize: "40px" }}>
            Be Productive
          </Typography>
          <Typography variant="h6" sx={{ color: "gray" }}>
            Personalised tips to boost productivity and reduce eye strain
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default PageTwo;
