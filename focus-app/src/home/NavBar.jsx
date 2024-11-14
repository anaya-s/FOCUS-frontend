import { useContext } from "react";
import Button from "@mui/material/Button";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const barStyle = {
  display: "flex",
  width: "100%",
  height: "10vh",
  position: "fixed",
  background: "white",
  top: "0",
  left: "0",
  borderBottom: "1px solid",
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
  let { user, logoutUser } = useContext(AuthContext);

  const toHome = () => {
    navigate("/");
  };

  const toLogin = () => {
    navigate("/login");
    console.log(user)
  };

  const toAbout = () => {
    navigate("/about");
  }
  const toDashboard = () => {
    navigate("/dashboard");
  }
  
  const text = user ? "Logout" : "Login";

  const handleUser = user ? logoutUser : toLogin;


  return (
    <div style={barStyle}>
      <Button onClick={toHome}>F.O.C.U.S</Button>
      <div style={navStyle}>
        {user && <Button style={buttonStyle} onClick={toDashboard}>Dashboard</Button>}
        <Button 
          style={buttonStyle}
          onClick={toAbout}
          >About</Button>
        <Button style={buttonStyle}>Our Products</Button>
        <Button
          onClick={handleUser}
          style={buttonStyle}
          variant="contained"
          color="primary"
        >
          {text}
        </Button> 
      </div>
    </div>
  );
};

export default NavBar;
