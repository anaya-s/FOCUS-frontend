import React from "react";

const logoStyle = {
  display: "flex",
  alignItems: "center",
  marginLeft: "10px",
};

const FocusLogo = () => {
  return (
    <div style={logoStyle}>
      <img
        src="/path/to/logo.png" // Replace with the actual path to your logo image
        alt="FOCUS Logo"
        style={{ width: "50px", height: "50px" }} // Adjust the size as needed
      />
    </div>
  );
};

export default FocusLogo;