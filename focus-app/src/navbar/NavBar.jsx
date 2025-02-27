import { useContext } from "react";
import { useNavigation } from "../utils/navigation";
import AccountMenu from "./account/AccountMenu";
import AuthContext from "../context/AuthContext";
import webgazer from "../webgazer/webgazer";

import { Button, Divider } from "@mui/material";

const barStyle = {
  display: "flex",
  width: "100%",
  height: "10vh",
  position: "fixed",
  background: "white",
  top: "0",
  left: "0",
  borderBottom: "1px solid",
  zIndex: 1500
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  marginLeft: "auto",
};

const buttonStyle = {
  padding: "8px",
  marginRight: "8px",
  borderRadius: "20px",
};

const NavBar = () => {
  let { user } = useContext(AuthContext);
  const { toHome, toLogin, toAbout, toOurProducts, toDrive, toDiagnostics} = useNavigation();

  // Function to stop webcam access (if any) after ending webgazer
  const stopCamera = () => {
    // Stop all video streams to turn off webcam
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      video.srcObject = null; 
    });
  
    // Remove all video container <div> elements
    const containers = document.querySelectorAll('#webgazerVideoContainer');
    containers.forEach((container) => {
      container.remove();
    });
  };

  return (
    <div style={barStyle}>
      <Button onClick={() => {webgazer.end(); stopCamera(); toHome()}} sx={{fontWeight: "bold", pl: "10px", pr: "10px", fontSize: "25px"}}>FOCUS</Button>
      <div style={navStyle}>
        <Button style={buttonStyle} onClick={() => {webgazer.end(); stopCamera(); toAbout()}}>About</Button>
        <Button style={buttonStyle} onClick={() => {webgazer.end(); stopCamera(); toOurProducts();}}>Our Products</Button>
        {user ? <Divider orientation="vertical" variant="middle" flexItem sx={{mr: "16px"}} /> : null}
        {user ? <Button style={buttonStyle} variant="outlined" onClick={() => {webgazer.end(); stopCamera(); toDrive(0);}}> Your Drive </Button> : null}
        {user ? <Button style={buttonStyle} variant="outlined" onClick={() => {webgazer.end(); stopCamera(); toDiagnostics();}}> Diagnostics </Button> : null}
        {user ? <AccountMenu /> : <Button style={buttonStyle} variant="contained" onClick={() => {webgazer.end(); stopCamera(); toLogin();}}> Login </Button>}
      </div>
    </div>
  );
};

export default NavBar;
