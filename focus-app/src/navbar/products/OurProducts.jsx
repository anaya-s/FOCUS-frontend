import { Typography } from "@mui/material";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "120px",
  height: "100vh"
};

const OurProducts = () => {

  return (
    <div style={pageStyle}>
    <Typography variant="h3">Our Products</Typography> 
  </div>
  );
};

export default OurProducts;
