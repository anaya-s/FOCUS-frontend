import { useEffect } from "react";
import { Typography, Container, Box, Divider } from "@mui/material";
import Developers from "./Developers";

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 }); // Auto-scroll to the top
  }, []);

  return (
    <Container maxWidth="md" sx={{ paddingTop: "120px", textAlign: "center" }}>
      {/* Page Title */}
      <Typography variant="h3" gutterBottom>
        About Us
      </Typography>

      {/* Introduction */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to FOCUS – Your Smart Reading Companion
        </Typography>
        <Typography variant="body1">
          FOCUS is an innovative web app designed to enhance productivity and reading efficiency 
          using eye-tracking and machine learning. Our goal is to help users stay focused, 
          reduce eye strain, and improve comprehension through adaptive reading modes and real-time feedback.
        </Typography>
      </Box>

      <Divider />

      {/* Mission Section */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1">
          At FOCUS, we are committed to revolutionising digital reading by leveraging cutting-edge technology. 
          We believe in creating a smarter, more personalised reading experience that enhances user engagement, 
          productivity, and well-being.
        </Typography>
      </Box>

      <Divider />

      {/* Our Story Section */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Our Story
        </Typography>
        <Typography variant="body1">
          FOCUS was born out of a need to tackle modern reading challenges—distractions, digital fatigue, and 
          difficulty in maintaining focus. By combining real-time eye-tracking with AI-driven insights, 
          we aim to provide users with an intuitive tool that adapts to their reading behavior.
        </Typography>
      </Box>

      <Divider />

      {/* Privacy & Ethics Section */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Our Commitment to Privacy & Ethics
        </Typography>
        <Typography variant="body1">
          User trust is at the core of FOCUS. We prioritise privacy, ensuring all eye-tracking data is collected 
          with user consent and stored securely. FOCUS is designed as an assistive tool, not a medical device, 
          adhering to ethical AI use and responsible data practices.
        </Typography>
      </Box>

      <Divider />
      
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Meet the Team
        </Typography>
        <Developers />
      </Box>
      
      <Divider />
      {/* Contact Us Section */}
      <Box sx={{ marginY: 4 }}>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1">
          Have questions or feedback? We'd love to hear from you!  
          Reach out to us at <strong>support@focusapp.com</strong> or follow us on social media for updates.
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutUs;
