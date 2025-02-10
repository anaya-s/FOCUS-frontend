import { useEffect } from "react";
import PageOne from "./pages/PageOne";
//import PageTwo from "./pages/PageTwo"; can be used to add more questions potentially


const containerStyle = {
  //display: 'flex',
  // height: '100vh'
};
const Questionnaire = () => {

  useEffect(() => {
    window.scrollTo({ top: 0 }); // auto-scroll to the top
  }, []);

  return (
    <div style={containerStyle}>
      <PageOne />
    </div>
  );
};

export default Questionnaire;