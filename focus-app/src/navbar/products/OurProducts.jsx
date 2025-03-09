import { useEffect } from "react";
import { Typography, Container, Box, Divider } from "@mui/material";

const OurProducts = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 }); // Auto-scroll to the top
  }, []);

  return (
    <Container maxWidth="md" sx={{ paddingTop: "120px", textAlign: "center" }}>
      {/* Page Title */}
      <Typography variant="h3" gutterBottom>
        Our Product - FOCUS
      </Typography>

      {/* Introduction */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h5" gutterBottom>
          What is FOCUS?
        </Typography>
        <Typography variant="body1">
          FOCUS is a cutting-edge web-based productivity tool that enhances reading efficiency through 
          real-time eye-tracking and machine learning. Designed to help users maintain concentration, 
          reduce eye strain, and improve comprehension, FOCUS adapts dynamically to reading habits.
        </Typography>
      </Box>

      <Divider />

      {/* Key Features */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="body1">
          <strong>Smart Text Highlighting:</strong> Improves comprehension by emphasising key sections based on eye movement. <br />
          <strong>PDF & Document Support:</strong> Upload and read PDFs with ease, with DOCX support coming soon. <br />
          <strong>Real-time Eye Tracking:</strong> Monitors blink rate and movement to analyse engagement and fatigue. <br />
          <strong>Break Suggestions:</strong> Helps prevent eye strain by recommending optimal rest intervals. <br />
          <strong>Productivity Dashboard:</strong> Provides insights on reading efficiency and focus trends.
        </Typography>
      </Box>

      <Divider />

      {/* Target Audience */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Who is FOCUS For?
        </Typography>
        <Typography variant="body1">
          <strong>Students & Researchers:</strong> Enhance reading efficiency and memory retention. <br />
          <strong>Professionals & Writers:</strong> Maintain productivity while avoiding digital eye fatigue. <br />
          <strong>Individuals Concerned About Eye Strain:</strong> Get real-time feedback to protect eye health.
        </Typography>
      </Box>

      <Divider />

      {/* How It Works */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="body1">
          1. Upload your document (PDF, with DOCX support coming soon). <br />
          2. FOCUS highlights key sections to improve readability. <br />
          3. Eye-tracking monitors engagement and detects fatigue. <br />
          4. Productivity insights and break reminders help optimise your workflow.
        </Typography>
      </Box>

      <Divider />

      {/* Future Enhancements */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          What's Next?
        </Typography>
        <Typography variant="body1">
          We are continuously improving FOCUS. Upcoming features include: <br />
          <strong>Natural Language Processing:</strong> Identifying key words for better memory retention. <br />
          <strong>Neurodegeneration Detection:</strong> Early warning indicators based on reading patterns. <br />
          <strong>Expanded File Support:</strong> Uploading and reading additional document formats.
        </Typography>
      </Box>

      <Divider />

      {/* Call to Action */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Get Started Today!
        </Typography>
        <Typography variant="body1">
          Experience the future of focused reading. Try FOCUS now and take control of your productivity!
        </Typography>
      </Box>
    </Container>
  );
};

export default OurProducts;
