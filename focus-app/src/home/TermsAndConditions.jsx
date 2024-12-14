import { useEffect } from "react";
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

const TermsAndConditions = () => {

    useEffect(() => {
        window.scrollTo({ top: 0 }); // auto-scroll to the top
      }, []);

  return (
    <div style={pageStyle}>
      <Typography variant="h3">Terms and Conditions</Typography>
    </div>
  );
};

export default TermsAndConditions;
