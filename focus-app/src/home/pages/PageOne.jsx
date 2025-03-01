import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigation } from "../../utils/navigation";

const pageStyle = {
  display: "flex",
  alignItems: "center",    
  justifyContent: "center", 
  height: "100vh",
  gap: "200px", 
  // background: "#77dd77",
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", 
  textAlign: "center",
  gap: "15px", 
};


const imageStyle = {
  width: "400px",
  height: "225px",
};

const PageOne = () => {

  const { toOurProducts, toRegister } = useNavigation();

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <Typography variant="h3" fontWeight="bold">Unlock your potential</Typography>
        <Typography variant="h4" fontWeight="bold">with FOCUS</Typography>
        <Typography variant="h7">
          Enhance Reading and Boost Productivity
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: "20px" }} 
          onClick={toOurProducts}
        >
          FIND OUT MORE
        </Button>
        <Button variant="h4" sx={{ borderRadius: "20px" }} onClick={toRegister}>
          CREATE AN ACCOUNT
        </Button>
      </div>
      <div>
        <img
          src="/images/homepage/felixspeech.png" 
          alt="Felix the productivity robot"
          style={imageStyle}
        />
      </div>
    </div>
  );
};

export default PageOne;