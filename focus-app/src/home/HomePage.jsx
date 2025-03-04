import { useEffect } from "react";
import PageOne from "./pages/PageOne";
import PageTwo from "./pages/PageTwo";
import PageThree from "./pages/PageThree";
import PageFour from "./pages/PageFour";
import PageFive from "./pages/PageFive";

const containerStyle = {
  height: "100vh",
  overflowY: "scroll",
  scrollSnapType: "y mandatory",
  scrollbarWidth: "none",
};

const pageStyle = {
  scrollSnapAlign: "center",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const HomePage = () => {
  return (
    <div style={containerStyle}>
      <div style={pageStyle}><PageOne /></div>
      <div style={pageStyle}><PageTwo /></div>
      <div style={pageStyle}><PageThree /></div>
      <div style={pageStyle}><PageFour /></div>
      <div style={pageStyle}><PageFive /></div>
    </div>
  );
};

export default HomePage;
