import { useContext } from "react";
import Button from "@mui/material/Button";
import { useNavigation } from "../utils/navigation";
import AccountMenu from "./account/AccountMenu";
import AuthContext from "../context/AuthContext";
import zIndex from "@mui/material/styles/zIndex";
import webgazer from "../webgazer/webgazer";

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
  padding: "5px",
  marginRight: "5px",
  borderRadius: "17px",
};

const NavBar = () => {
  let { user } = useContext(AuthContext);
  const { toHome, toLogin, toAbout, toOurProducts} = useNavigation();

  return (
    <div style={barStyle}>
      <Button onClick={() => {webgazer.end(); toHome()}} sx={{fontWeight: "bold", pl: "10px", pr: "10px", fontSize: "25px"}}>FOCUS</Button>
      <div style={navStyle}>
        <Button style={buttonStyle} onClick={() => {webgazer.end(); toAbout()}}>
          About
        </Button>
        <Button style={buttonStyle} onClick={() => {webgazer.end(); toOurProducts();}}>Our Products</Button>
        {user ? <AccountMenu /> : <Button style={buttonStyle} onClick={() => {webgazer.end(); toLogin();}}> Login </Button>}
      </div>
    </div>
  );
};

export default NavBar;
