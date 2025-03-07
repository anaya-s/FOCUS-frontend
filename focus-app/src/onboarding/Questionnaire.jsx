import { useEffect, useState } from "react";
import PageOne from "./pages/PageOne";
import PageTwo from "./pages/PageTwo";
import PageThree from "./pages/PageThree";
import PageFour from "./pages/PageFour";
import PageFive from "./pages/PageFive";
import PageSix from "./pages/PageSix";
import config from "../config";

import { reauthenticatingFetch } from "../utils/api";

const containerStyle = {
  //display: 'flex',
  // height: '100vh'
};

const baseURL = config.apiUrl;

const Questionnaire = () => {
  const [data, setData] = useState({
    name: "",
    dob: "",
    screen_time: 0,
    sleep_time: 0,
    eye_strain: false,
    glasses: false,
    timestamp: Date.now(),
  });

  useEffect(() => {
    window.scrollTo({ top: 0 }); // auto-scroll to the top
  }, []);

  const handleSubmit = async () => {

    try {
      const response = await reauthenticatingFetch("POST", `${baseURL}/api/user/onboarding/`, data)
      console.log(data);
      
      if (response.error) {
        console.error("Failed to save onboarding data:", response.error);
      } else {
        console.log("Onboarding data saved successfully:");
      }
    } 
    catch (error) {
      console.error("Error submitting onboarding data:", error);
    }
    
  };

  const updateData = (newData) => {
    setData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  return (
    <div style={containerStyle}>
      <PageOne updateData={updateData} />
      <PageTwo updateData={updateData} />
      <PageThree updateData={updateData} />
      <PageFour updateData={updateData} />
      <PageFive updateData={updateData} />
      <PageSix updateData={updateData} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Questionnaire;