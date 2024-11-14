import Typography from "@mui/material/Typography";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", 
  justifyContent: "center", 
  height: "100vh",
  textAlign: "center", 
  padding: "0 150px", 
};

const PageFive = () => {
  return (
    <div style={pageStyle}>
      <Typography variant="h2" fontWeight="bold">
        F.O.C.U.S makes it easy to boost productivity, empowering you to work
        smarter in the digital age.
      </Typography>
    </div>
  );
};

export default PageFive;