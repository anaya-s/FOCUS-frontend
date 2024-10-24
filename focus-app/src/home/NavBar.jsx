import React from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const barStyle = {
  display: "flex",
  width: "100%",
  height: "10vh",
  position: "fixed",
  background: "white",
  top: "0",
  left: "0",
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  marginLeft: "auto",
};

const buttonStyle = {
  padding: "5px",
  marginRight: "5px",
  borderRadius: "17px",
};

const NavBar = () => {
  const navigate = useNavigate();

  const toHome = () => {
    navigate("/");
  };

  const toLogin = () => {
    navigate("/login");
  };

  return (
    <div style={barStyle}>
      <Button onClick={toHome}>F.O.C.U.S</Button>
      <div style={navStyle}>
        <Button style={buttonStyle}>About</Button>
        <Button style={buttonStyle}>Our Products</Button>
        <Button
          onClick={toLogin}
          style={buttonStyle}
          variant="contained"
          color="primary"
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
