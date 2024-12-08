import { Typography } from "@mui/material";
import { useContext, useState, useEffect} from "react";
import AuthContext from "../../context/AuthContext";
import { reauthenticatingFetch } from "../../utils/api";

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
    const responseMsg = await reauthenticatingFetch("GET", "http://127.0.0.1:8000/api/eye/last-blink-count/");

    if (responseMsg.blink_count) {
      console.log(responseMsg.blink_count)
      setNumber(responseMsg.blink_count);

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
