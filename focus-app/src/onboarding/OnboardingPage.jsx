import React, { useState } from "react";
import { Stepper, Step, StepLabel, Box, Button } from "@mui/material";
import Questionnaire from "./Questionnaire"; // Import the questionnaire component
//import CalibrationPage from "../calibration/Calibration"; 
import TEMP from "./TEMP1.jsx"; 
import CalibrationPage from "./CalibrationOnboarding1.jsx"; // Import the calibration component
//import PdfUploadPage from "../pdf_upload/PdfUploadPage"; // Existing PDF upload page

const steps = ["Questionnaire", "Calibration", "PDF Upload"];

const Onboarding = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Questionnaire />;
      case 1:
        return <CalibrationPage />;
      case 2:
        return <TEMP />;
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
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 5 }}>{renderStepContent(activeStep)}</Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
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
          disabled={activeStep === steps.length - 1}
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default Onboarding;
