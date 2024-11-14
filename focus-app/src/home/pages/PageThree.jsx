import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const pageStyle = {
  display: "flex",
  alignItems: "center", 
  justifyContent: "center", 
  height: "100vh",
  marginLeft: "120px",    
  marginRight: "30px",
  padding: "0 20px", 
};

const leftColumnStyle = {
  flex: "1", 
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", 
  textAlign: "left", 
  paddingRight: "200px", 
};

const rightColumnStyle = {
  flex: "1", 
  display: "flex",
  justifyContent: "center", 
  alignItems: "center", 
};

const buttonStyle = {
  borderRadius: "17px",
  marginTop: "20px", 
};

const imageStyle = {
  width: "500px", 
  height: "500px", 
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
        <Button style={buttonStyle} variant="contained" color="primary">
          Get Started
        </Button>
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