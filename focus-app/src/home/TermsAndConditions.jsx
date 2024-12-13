import { Typography } from "@mui/material";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "120px", // Add padding to the top
  height: "100vh"
};

const TermsAndConditions = () => {
  return (
    <div style={pageStyle}>
      <Typography variant="h3">Terms and Conditions</Typography>
    </div>
  );
};

export default TermsAndConditions;
