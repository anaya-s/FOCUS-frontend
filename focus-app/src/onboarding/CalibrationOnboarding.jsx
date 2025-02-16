import { useEffect } from "react";
import CalibrationPage from "../calibration/Calibration"; 
//import PageTwo from "./pages/PageTwo"; can be used to add more questions potentially


const containerStyle = {
  //display: 'flex',
  // height: '100vh'
};
const CalibrationComponent = () => {

  useEffect(() => {
    window.scrollTo({ top: 0 }); // auto-scroll to the top
  }, []);

  return (
    <div style={containerStyle}>
      <CalibrationPage />
    </div>
  );
};

export default CalibrationComponent;