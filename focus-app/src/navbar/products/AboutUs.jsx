import { Typography } from "@mui/material";
import { useContext, useState, useEffect} from "react";
import AuthContext from "../../context/AuthContext";

const pageStyle = {
  display: "flex",
  height: "100vh",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

const AboutUs = () => {
  const [nblinks, setNumber] = useState(0);
  let { authTokens } = useContext(AuthContext);
  let totalBlinks = async () => {

    let accessToken = localStorage.getItem("authTokens");

    console.log("Token: ", accessToken)

    let options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    };

    console.log(options)

    let response = await fetch("http://127.0.0.1:8000/api/eye/api/last-blink-count/", options);
    
    let data = await response.json();

    if (response.status === 200) {
      console.log(data)
      setNumber(data.blink_count);

    } else {
      alert("Credentials do not match");
    }
  };
  useEffect(() => {
    totalBlinks();
  }, []);
  return (
    <div style={pageStyle}>
    <Typography variant="h3">Lewis is KING</Typography> 
    <h1>The King has blinked: {nblinks} times!</h1>
  </div>
  );
};

export default AboutUs;
