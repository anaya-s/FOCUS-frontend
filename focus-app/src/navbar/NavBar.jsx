import { useContext } from "react";
import Button from "@mui/material/Button";
import { useNavigation } from "../utils/navigation";
import AccountMenu from "./account/AccountMenu";
import AuthContext from "../context/AuthContext";
import zIndex from "@mui/material/styles/zIndex";

const barStyle = {
  display: "flex",
  width: "100%",
  height: "10vh",
  position: "fixed",
  background: "white",
  top: "0",
  left: "0",
  borderBottom: "1px solid",
  zIndex: 10
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
  const { toHome, toLogin, toAbout } = useNavigation();

  return (
    <div style={barStyle}>
      <Button onClick={toHome}>F.O.C.U.S</Button>
      <div style={navStyle}>
        <Button style={buttonStyle} onClick={toAbout}>
          About
        </Button>
        <Button style={buttonStyle}>Our Products</Button>
        {user ? <AccountMenu /> : <Button style={buttonStyle} onClick={toLogin}> Login </Button>}
      </div>
    </div>
  );
};

export default NavBar;
