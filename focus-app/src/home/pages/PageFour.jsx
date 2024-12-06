import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  display: "flex",
  alignItems: "center", 
  justifyContent: "center", 
  height: "100vh",
  marginRight: "150px",
  padding: "0 20px", 
};

const leftColumnStyle = {
  flex: "1",
  display: "flex",
  justifyContent: "center",
};

const rightColumnStyle = {
  flex: "1", 
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", 
  textAlign: "left",
  paddingLeft: "20px", 
};

const buttonStyle = {
  borderRadius: "17px",
  marginTop: "20px",
};

const imageStyle = {
  width: "250px", 
  height: "auto", 
};

const PageFour = () => {
  return (
    <div style={pageStyle}>
      <div style={leftColumnStyle}>
        <img
          src="/images/homepage/felix.png" 
          alt="Felix the productivity robot"
          style={imageStyle}
        />
      </div>
      <div style={rightColumnStyle}>
        <Typography variant="h3" sx={{ fontSize: "30px" }}>
          Smart Breaks
        </Typography>
        <Typography variant="h2" fontWeight="bold">
          Stay on top with your progress
        </Typography>
        <Typography variant="body1" sx={{ color: "gray" }}>
          Access your own personalised dashboard with Felix. Felix ensures
          productivity by encouraging the 20-20-20 rule, helping prevent eye
          fatigue with regular breaks.
        </Typography>
        <Button style={buttonStyle} variant="contained" color="primary">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default PageFour;
