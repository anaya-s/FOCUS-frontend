import React from "react";
import Typography from "@mui/material/Typography";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Centers content horizontally
  justifyContent: "center", // Centers content vertically
  height: "100vh",
  textAlign: "center", // Centers text within each Typography component
  padding: "0 150px", // Optional: Adds padding for small screens
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
