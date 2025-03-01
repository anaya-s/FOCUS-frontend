import { Avatar, Box, Typography, IconButton } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const DeveloperCard = ({ name, image, role, linkedin }) => {
  return (
    <Box display="flex" gap={2}>
      <Avatar 
        src={image} 
        alt={name} 
        sx={{ width: 150, height: 150, border: "3px solid #4CAF50" }} 
      />
      <Box sx={{ width: 220, height: 150, display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
        <Typography variant="h5">
          {role}
        </Typography>      
        <Typography variant="h6">
          {name}
        </Typography>
        <IconButton 
          component="a" 
          href={linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ color: "#0077b5" }} 
        >
          <LinkedInIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default function Developers() {
  return (
    <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap">
      <DeveloperCard 
        name="Davide" 
        image="/images/aboutus/Davide.jpg"
        role="Project Supervisor"
        linkedin="https://www.linkedin.com/in/davide-piaggio-90a99912b/"
      />
      <DeveloperCard
        name="Wanzi"
        role="Project Advisor"
        linkedin=""
      />
      <DeveloperCard
        name="Brandon" 
        image="/images/aboutus/Brandon.jpeg"
        role="Developer"
        linkedin="https://www.linkedin.com/in/brandon-hong-5726b5189/"
      />
      <DeveloperCard 
        name="Mahiethan" 
        image="/images/aboutus/Mahiethan.jpg" 
        role="Developer"
        linkedin="https://www.linkedin.com/in/mahiethan-nitharsan-421b14235/"
      />
      <DeveloperCard 
        name="Anaya" 
        image="/images/aboutus/Anaya.png" 
        role="Developer"
        linkedin="https://www.linkedin.com/in/anaya-shah-933a46203/"
      />
      <DeveloperCard 
        name="Lewis" 
        image="/images/aboutus/Lewis.png" 
        role="Developer"
        linkedin="https://www.linkedin.com/in/lewis-arnold1/"
      />
      <DeveloperCard 
        name="Soniya" 
        image="/images/aboutus/Soniya.jpg"
        role="Developer"
        linkedin="https://www.linkedin.com/in/soniyaaryal/"
      />
      <DeveloperCard 
        name="Zakariya" 
        image="/images/aboutus/Zak.png" 
        role="Developer"
        linkedin="https://www.linkedin.com/in/zakariya-lilani/"
      />
      {/* <DeveloperCard name="Jane Smith" image="/images/aboutus/Waasiq.jpg" /> */}
    </Box>
  );
}
