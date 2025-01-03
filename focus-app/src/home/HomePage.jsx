import { useEffect } from "react";
import PageOne from "./pages/PageOne";
import PageTwo from "./pages/PageTwo";
import PageThree from "./pages/PageThree";
import PageFour from "./pages/PageFour";
import PageFive from "./pages/PageFive";

const containerStyle = {
  //display: 'flex',
  // height: '100vh'
};
const HomePage = () => {

  useEffect(() => {
    window.scrollTo({ top: 0 }); // auto-scroll to the top
  }, []);

  return (
    <div style={containerStyle}>
      <PageOne />
      <PageTwo />
      <PageThree />
      <PageFour />
      <PageFive />
    </div>
  );
};

export default HomePage;
