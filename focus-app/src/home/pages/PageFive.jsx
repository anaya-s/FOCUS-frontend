import Typography from "@mui/material/Typography";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", 
  justifyContent: "center", 
  height: "75vh",
  textAlign: "center", 
  padding: "0 150px", 
};

const PageFive = () => {
  return (
    <div style={pageStyle}>
      <Typography variant="h2" fontWeight="bold">
        FOCUS makes it easy to boost productivity, empowering you to work
        smarter in the digital age.
      </Typography>
    </div>
  );
};

export default PageFive;