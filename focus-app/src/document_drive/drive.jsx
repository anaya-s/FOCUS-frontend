import { React, useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Grid2,
  Card,
  CardContent,
  CardActions,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  CardMedia,
  CardHeader,
  InputAdornment
} from "@mui/material";
import { CloudUpload, StarBorder, AccessTime, MoreHoriz } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';

function DocumentDrivePage() {

  const [allDocButtonState, clickAllDocuments] = useState(true);
  const [recentButtonState, clickRecent] = useState(false);
  const [starredButtonState, clickStarred] = useState(false);

  // For each of the Sidebar filter buttons, add code to filter the document tiles
  useEffect(() => {
    if(allDocButtonState == true)
    {
      clickRecent(false);
      clickStarred(false);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to the top with smooth animation
    }

    // Add code here for filtering document tiles
    
  }, [allDocButtonState]);

  useEffect(() => {
    if(recentButtonState == true)
    {
      clickAllDocuments(false);
      clickStarred(false);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to the top with smooth animation
    }

    // Add code here for filtering document tiles

  }, [recentButtonState]);

  useEffect(() => {
    if(starredButtonState == true)
    {
      clickAllDocuments(false);
      clickRecent(false);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to the top with smooth animation
    }

    // Add code here for filtering document tiles

  }, [starredButtonState]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        pt: 10,
        pb: 10,
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
          backgroundColor: "#f1f1f1"
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex", // Use flexbox layout
            flexDirection: "column", // Ensure content is laid out in a column
            justifyContent: "center", // Vertically center content
            textAlign: "center",
            alignItems: "center",
            mt: 12,
          }}
        >
          <Typography variant="h7" gutterBottom>
            Upload a new document
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CloudUpload sx={{ mr: 1 }} />}
            sx={{ mt: 4, mb: 5, borderWidth: 3, borderRadius: 30, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)', backgroundColor: 'white'}}
          >
            <div>
              <Typography variant="h6">Upload</Typography>
              <Typography variant="h7" color="textSecondary">
                .pdf .docx .txt
              </Typography>
            </div>
          </Button>
          <Divider sx={{ mb: 5, width: "100%" }}>OR</Divider>
          <Typography variant="h7" gutterBottom>
            Continue where you left off
          </Typography>
          <Button  variant={allDocButtonState ? "contained" : "outlined"} onClick={() => clickAllDocuments(true)} sx={{ mt: 4, mb: 4, maxWidth: 175, borderWidth: 3, borderRadius: 30, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)', backgroundColor: allDocButtonState ? '' : 'white' }}>
            All documents
          </Button>
          <Button variant={recentButtonState ? "contained" : "outlined"} onClick={() => clickRecent(true)} startIcon={<AccessTime />} sx={{ mb: 4, maxWidth: 175, borderWidth: 3, borderRadius: 30, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)', backgroundColor: recentButtonState ? '' : 'white'}}>
            Recent
          </Button>
          <Button variant={starredButtonState ? "contained" : "outlined"} onClick={() => clickStarred(true)} startIcon={<StarBorder />} sx={{ mb: 4, maxWidth: 175,borderWidth: 3, borderRadius: 30, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)', backgroundColor: starredButtonState ? '' : 'white'}}>
            Starred
          </Button>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: "240px", mt: 2 }}>
        <Typography variant="h2" gutterBottom sx={{textAlign: "center", mb: 5}}>
          Welcome to your drive
        </Typography>
        <TextField
          placeholder="Search for a document"
          variant="outlined"
          sx={{ display: "flex", alignContent: "center", justifyContent: "center", marginLeft: "auto", marginRight: "auto", width: "60%", mb: 6, "& .MuiOutlinedInput-root": {borderRadius: "9999px"} }}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>,
            },
          }}
        />

        <Grid2 container spacing={3} sx={{display: "flex", alignContent: "center", justifyContent: "center"}}>
          {Array(10)
            .fill()
            .map((_, index) => (
              <Grid2 item xs={12} sm={6} md={3} key={index}>
                <Card sx={{border: '2px solid',  borderColor: 'primary.main', borderRadius: '30px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'}}>
                  <CardHeader
                    title={<Typography variant="h6">DocumentName.pdf</Typography>}
                    action={
                      <IconButton>
                        <StarBorder />
                      </IconButton>
                    }
                  />
                  <CardMedia
                    component="img"
                    height="194"
                    image="/public/images/drive/Temp.png"
                    alt="Temp"
                  />
                  <CardHeader
                    title={<Typography variant="body2">Opened on 1/11/2024</Typography>}
                    action={
                      <IconButton>
                        <MoreHoriz />
                      </IconButton>
                    }
                  />
                </Card>
              </Grid2>
            ))}
        </Grid2>
      </Box>
    </Box>
  );
}

export default DocumentDrivePage;
