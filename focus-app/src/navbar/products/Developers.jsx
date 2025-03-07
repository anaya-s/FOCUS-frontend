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
    <Box display="flex" flexDirection="column" gap={2} marginLeft='2rem'>
      {/* Frontend Developers Section */}
      <Typography variant="h5" fontWeight="bold">Frontend Developers</Typography>
      <Box display="flex" justifyContent="flex-start" gap={4} flexWrap="wrap">
        <DeveloperCard
          name="Brandon Hong" 
          image="/images/aboutus/Brandon.jpeg"
          role="Frontend Developer"
          linkedin="https://www.linkedin.com/in/brandon-hong-5726b5189/"
        />
        <DeveloperCard 
          name="Mahiethan Nitharsan" 
          image="/images/aboutus/Mahiethan.jpg" 
          role="Frontend Developer"
          linkedin="https://www.linkedin.com/in/mahiethan-nitharsan-421b14235/"
        />
        <DeveloperCard 
          name="Anaya Shah" 
          image="/images/aboutus/Anaya.png" 
          role="Frontend Developer"
          linkedin="https://www.linkedin.com/in/anaya-shah-933a46203/"
        />
      </Box>

      {/* Backend Developers Section */}
      <Typography variant="h5" fontWeight="bold">Backend Developers</Typography>
      <Box display="flex" justifyContent="flex-start" gap={4} flexWrap="wrap">
        <DeveloperCard 
          name="Lewis Arnold" 
          image="/images/aboutus/Lewis.png" 
          role="Backend Developer"
          linkedin="https://www.linkedin.com/in/lewis-arnold1/"
        />
        <DeveloperCard 
          name="Soniya Aryal" 
          image="/images/aboutus/Soniya.jpg"
          role="Backend Developer"
          linkedin="https://www.linkedin.com/in/soniyaaryal/"
        />
        <DeveloperCard 
          name="Zakariya Lilani" 
          image="/images/aboutus/Zak.png" 
          role="Backend Developer"
          linkedin="https://www.linkedin.com/in/zakariya-lilani/"
        />
        <DeveloperCard
          name="Waasiq"
          role="Backend Developer"
        />
      </Box>

      {/* Supervisors & Advisors Section */}
      <Typography variant="h5" fontWeight="bold">Supervisors & Advisors</Typography>
      <Box display="flex" justifyContent="flex-start" gap={4} flexWrap="wrap">
        <DeveloperCard 
          name="Davide Piaggio" 
          image="/images/aboutus/Davide.jpg"
          role="Project Supervisor"
          linkedin="https://www.linkedin.com/in/davide-piaggio-90a99912b/"
        />
        <DeveloperCard
          name="Wanzi Su"
          role="Project Advisor"
          image="/images/aboutus/wanzi.png"
        />
      </Box>
    </Box>
  );
}
