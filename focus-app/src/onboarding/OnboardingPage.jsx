import React, { useState } from "react";
import { Stepper, Step, StepLabel, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Questionnaire from "./Questionnaire.jsx"; // Import the questionnaire component
import CalibrationPage from "./CalibrationOnboarding.jsx"; // Import the calibration component
import PageOne from "./pages/PageOne";
import PageTwo from "./pages/PageTwo";
import PageThree from "./pages/PageThree";
import PageFour from "./pages/PageFour";
import PageFive from "./pages/PageFive";
import PageSix from "./pages/PageSix";
import config from "../config";
import PdfUploadPage from "../document_drive/drive";

const steps = [
  "Question 1",
  "Question 2",
  "Question 3",
  "Question 4",
  "Question 5",
  "Question 6",
  "Calibration"
];

const Onboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleNext = () => {
    if (activeStep === steps.length -1) {
      navigate("/drive"); // Navigate to the PDF upload page after the calibration step
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <PageOne />;
      case 1:
        return <PageTwo />;
      case 2:
        return <PageThree />;
      case 3:
        return <PageFour />;
      case 4:
        return <PageFive />;
      case 5:
        return <PageSix />;
      case 6:
        return <CalibrationPage />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh", // Full viewport height
        overflowY: "auto", // Enable vertical scrolling for overflow
        display: "flex",
        flexDirection: "column",
        padding: 2, // Optional padding for aesthetics
        boxSizing: "border-box",
        paddingTop: "120px",
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2000 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", mt: 5, zIndex: 1000 }}>
        <Box sx={{ zIndex: 2000 }}>
          {renderStepContent(activeStep)}
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          sx={{ zIndex: 2000 }}
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="contained"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          variant="contained"
          color="primary"
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default Onboarding;