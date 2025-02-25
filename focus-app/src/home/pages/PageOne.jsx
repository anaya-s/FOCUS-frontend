import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigation } from "../../utils/navigation";

const pageStyle = {
  display: "flex",
  alignItems: "center",    
  justifyContent: "center", 
  height: "75vh",
  gap: "200px", 
};

const leftColumnStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", 
  textAlign: "center", 
  gap:"15px", 
};

const rightColumnStyle = {
  flex: "1", 
  display: "flex",
  justifyContent: "center", 
  alignItems: "center", 
};

const imageStyle = {
  width: "500px",
  height: "500px",
};

const PageOne = () => {

  const { toOurProducts, toRegister } = useNavigation();

  return (
    <div style={pageStyle}>
      <div style={leftColumnStyle}>
        <Typography variant="h3" fontWeight="bold">Unlock your potential</Typography>
        <Typography variant="h4" sx={{ fontSize: "45px" }}fontWeight="bold">with FOCUS</Typography>
        <Typography variant="h7" sx={{ fontSize: "25px" }}>
          Enhance Reading and Boost Productivity
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: "15px", fontSize: "20px"}} 
          onClick={toOurProducts}
          
        >
          FIND OUT MORE
        </Button>
        <Button variant="h4" sx={{ borderRadius: "20px", fontSize: "20px" }} onClick={toRegister}>
          CREATE AN ACCOUNT
        </Button>
        </div>
      <div>
      <div style={rightColumnStyle}>
        <img
          src="/images/homepage/felix_done.png" 
          alt="Felix the productivity robot"
          style={imageStyle}
        />
        </div>
      </div>
    </div>
  );
};

export default PageOne;