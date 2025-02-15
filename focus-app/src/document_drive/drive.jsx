import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "../utils/navigation";
import { useLocation } from 'react-router-dom';
import webgazer from "../webgazer/webgazer";

import config from '../config'
const baseURL = config.apiUrl

import {
  Drawer,
  Button,
  Grid2,
  Card,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  CardMedia,
  CardHeader,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  Collapse
} from "@mui/material";
import {
  CloudUpload,
  StarRounded,
  AccessTime,
  MoreHoriz,
} from "@mui/icons-material";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import SearchIcon from "@mui/icons-material/Search";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Swal from "sweetalert2";

import { parseText } from "../text_reader/textParsing";
import { reauthenticatingFetch } from "../utils/api";
import { DragAndDropOverlay } from "./DragAndDropOverlay";

function DocumentDrivePage() {
  /* Temporary data for document tiles - update this with real document data from backend */
  var files = [
    // {
    //   name: "Document1.docx",
    //   object: "",
    //   thumbnail: "",
    //   isStarred: false,
    //   lastOpened: "1/11/2024",
    // },
    // {
    //   name: "Document2.docx",
    //   thumbnail: "",
    //   isStarred: true,
    //   lastOpened: "2/11/2024",
    // },
    // {
    //   name: "ProjectBrief.pdf",
    //   thumbnail: "",
    //   isStarred: false,
    //   lastOpened: "3/11/2024",
    // },
    // {
    //   name: "TechnicalReport.pdf",
    //   thumbnail: "",
    //   isStarred: false,
    //   lastOpened: "3/11/2024",
    // },
    // {
    //   name: "README.txt",
    //   thumbnail: "",
    //   isStarred: false,
    //   lastOpened: "4/11/2024",
    // },
    // {
    //   name: "Notes.docx",
    //   thumbnail: "",
    //   isStarred: false,
    //   lastOpened: "6/11/2024",
    // },
    // {
    //   name: "DocumentName6.pdf",
    //   thumbnail: "",
    //   isStarred: false,
    //   lastOpened: "6/11/2024",
    // },
  ];

  const { toCalibration, toReadingPage } = useNavigation();

  const [fileDetails, setFileDetails] = useState(files);

  const sortAlphabetically = (files) =>
    [...files].sort((a, b) => a.name.localeCompare(b.name));

  const sortByDate = (files) =>
    [...files].sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened));

  const filterStarred = (files) => files.filter((file) => file.isStarred);

  const searchFiles = (query) => {
    return fileDetails.filter((file) =>
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const [allDocButtonState, setAllDocButtonState] = useState(true);
  const [recentButtonState, setRecentButtonState] = useState(false);
  const [starredButtonState, setStarredButtonState] = useState(false);
  const [documentTiles, setDocumentTiles] = useState(sortAlphabetically(fileDetails));

  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();

  const { error } = location.state || {};

  /*
  Status of connection to backend server (used for retrying connection and for showing alerts):
    -1 - Successful connection (message cleared)
    0 - Successful connection message
    1 - Connecting message
    2 - Lost connection message
  */
  const [retryConnection, setRetryConnection] = useState(1);

  // const hasFetched = useRef(false);

  const [showAlert, setShowAlert] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(-1);
  // const isRenaming = useRef(false); 

  useEffect(() => {
    // Retrieve data from database and set fileDetails
    const getFiles = async () => {  
      try {
        const data = await reauthenticatingFetch("GET", `${baseURL}/api/user/file-list/`);

        // console.log(files);
        // console.log(data); 
    
        files = data;
        setFileDetails(sortAlphabetically(files));
        setDocumentTiles(sortAlphabetically(files));

        setRetryConnection(0);
      } catch (error) {
          console.error("Error fetching files:", error);
          setRetryConnection(2);
          setDocumentTiles([]);
      }
    };

    if(retryConnection === 1)
    {
      // hasFetched.current = false;
      getFiles();
    }

    // if(retryConnection <= 0)
    //   hasFetched.current = true;

  }, [retryConnection]);


  const [menuIndex, setMenuIndex] = useState(null);

  const showSearches = (query) => {
    if (query !== "") {
      setAllDocButtonState(false);
      setRecentButtonState(false);
      setStarredButtonState(false);

      setDocumentTiles(searchFiles(query));
    }

    return documentTiles;
  };

  const handleEnterKeySearches = (e) => {
    if (e.key === 'Enter') {
      showSearches(searchQuery);
    }
  };

  useEffect(() => {
    if(isUploading | isFetching | showAlert)
    {
      setIsDeleting(-1);
    }
  }, [isUploading, isFetching, showAlert]);

  useEffect(() => {
    webgazer.end(); // stop the webgazer instance when pressing back arrow from reading page

    if (error === 1) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }

    // const saveFilesBeforeUnload = () => {
    //   // console.log(hasFetched.current);
    //   if(hasFetched.current) // Only save when connection is successful and files already fetched, NOT during fetching process
    //   {
    //     console.log("Exitting Drive");
    //     // Add API call here to save files

    //   }
    // };

    // window.addEventListener("unload", saveFilesBeforeUnload);

    // return () => {
    //   window.removeEventListener("unload", saveFilesBeforeUnload);

    //   // Save files to database before exiting or reloading
    //   // console.log("Saving files to database"); 
    //   saveFilesBeforeUnload();
    // };
  }, []);

  const changeStarredStatus = (index) => {
    documentTiles[index].isStarred = !documentTiles[index].isStarred;

    setFileDetails(sortAlphabetically(fileDetails));

    setDocumentTiles(
      allDocButtonState
        ? sortAlphabetically(fileDetails)
        : recentButtonState
        ? sortByDate(fileDetails)
        : filterStarred(fileDetails)
    );
  };

  const handleRename = (index, extension) => {
    Swal.fire({
      title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Rename File</span>',
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; justify-content: center; align-items: center; user-select: none; flex-direction: column;">
          <p variant=h7>Please enter a new name for the file: <span style="font-weight: bold">${documentTiles[index].name.replace(/\.(pdf|txt|docx)$/, '')}</span></p>
          <p>The extension <span style="font-weight: bold">${extension}</span> will be added to the new filename.</p>
        </div>
      `,
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      inputPlaceholder: "Enter new filename here",
      width: "40vw",
      confirmButtonColor: "#06760D",
      allowOutsideClick: false,
      showDenyButton: true,
      showConfirmButton: true,
      allowEscapeKey: true,
      denyButtonText:
        '<span style="user-select: none; padding: 0">Cancel</span>',
      confirmButtonText:
        '<span style="user-select: none; padding: 0">Rename</span>',
      customClass: {
        container: 'custom-swal-container', // Apply the custom class
      },
      preConfirm: () => {
        const newFilename = Swal.getInput().value.trim();
        const restrictedCharacters = /[\\/:*?"<>|.]/;
        if (/\.(txt|pdf|docx)$/i.test(newFilename))
        {
          Swal.showValidationMessage('<div style="display: flex; flex-direction: column; align-items: center, justify-content: center, text-align: center"><span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">Filename cannot end with ".txt", ".pdf", or ".docx". Please try again.</span><span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">The correct file extension will be added to the new name.</span></div>');
          return false;

        }
        if (restrictedCharacters.test(newFilename)) {
          Swal.showValidationMessage('<div style="display: flex; flex-direction: column; align-items: center, justify-content: center, text-align: center"><span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">Filename contains restricted characters.</span><span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">Please remove any \\ / : * ? " < > | . characters.</span></div>');
          return false;
        }
        if (!newFilename) {
          Swal.showValidationMessage('<span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">Filename cannot be empty. Please try again.</span>');
          return false;
        }
        if (fileDetails.some(file => file.name === newFilename + extension)) {
          Swal.showValidationMessage('<span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">A file with this name already exists. Please try again.</span>');
          return false;
        }
        return newFilename + extension;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newFilename = result.value;
        const updatedTiles = [...fileDetails];
        updatedTiles[index].name = newFilename;
        setFileDetails(sortAlphabetically(updatedTiles));
        setDocumentTiles(
          allDocButtonState
            ? sortAlphabetically(updatedTiles)
          : recentButtonState
            ? sortByDate(updatedTiles)
          : starredButtonState
            ? filterStarred(updatedTiles)
          : showSearches(searchQuery)
        );

        // const file = updatedTiles[index];

        // Update file in database with new filename
        // Create and use new API endpoint which takes in the old filename and new filename, and updates it
        // Can't use save-document endpoint to overwrite because I do not have access to the file objects in the drive page

      }
    });
  };



  const handleDelete = (index) => {
    Swal.fire({
      title:
        '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Confirm File Deletion</span>',
      html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none">
        <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; margin-top: 30px; user-select: none; pointer-events: none">
        <div style="margin-left: 20px; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
          <p>Are you sure you want to delete the file <span style="font-weight: bold">${documentTiles[index].name}</span>?</p>
          <p>This action cannot be undone.</p>
        </div>
      </div>
    `,
      icon: "warning",
      iconColor: "orange",
      width: "40vw",
      confirmButtonColor: "#06760D",
      allowOutsideClick: false,
      showDenyButton: true,
      showConfirmButton: true,
      allowEscapeKey: true,
      denyButtonText:
        '<span style="user-select: none; padding: 0">Cancel</span>',
      confirmButtonText:
        '<span style="user-select: none; padding: 0">Confirm</span>',
      customClass: {
        container: 'custom-swal-container' // Apply the custom class
      },
    }).then(async(result) => {
      if (result.isConfirmed) {

        // Delete file from database
        try
        {
          var fileNameToRemove = documentTiles[index].name;

          setIsDeleting(1);

          const response = await reauthenticatingFetch("DELETE", `${baseURL}/api/user/file-delete?file_name=${encodeURIComponent(fileNameToRemove)}`, undefined, false);

          documentTiles.splice(index, 1);
          var updatedFiles = fileDetails.filter(file => file.name !== fileNameToRemove)
          setFileDetails(updatedFiles);
          setDocumentTiles(
            allDocButtonState
              ? sortAlphabetically(updatedFiles)
            : recentButtonState
              ? sortByDate(updatedFiles)
            : starredButtonState
              ? filterStarred(updatedFiles)
            : showSearches(searchQuery)
          );

          setIsDeleting(0);
        } 
        catch (error)
        {
          console.error("Error deleting file:", error);
          setIsDeleting(-1);
          setRetryConnection(2);
          setDocumentTiles([]);
        }
      }
    });
  };

  // Change this to retrieve data from database instead of getting from new uploaded file
  const handleFileSelection = async (fileName) => {

    setIsFetching(true);

    try
    {
      const response = await reauthenticatingFetch("GET", `${baseURL}/api/user/document-load?file_name=${fileName}`, undefined, false);
    
      const readingProgress = {"lineNumber" : response.headers.get('line-number'), "pageNumber": response.headers.get('page-number')};
      // console.log(readingProgress);

      const blob = await response.blob();

      const file = new File([blob], fileName, {type: blob.type});

      // Parse the text from the file and send it the text reader page
      const parsedText = await parseText(file);

      // send readingProgress too
    
      toReadingPage(file, parsedText);
    }
    catch(error)
    {
      console.error("Error loading file", error);
      setIsFetching(false);
      setRetryConnection(2);
      setDocumentTiles([]);
      return null;
    }
  };

  const handleFileUpload = async (file) => {

    const formData = new FormData();
    formData.append("file_name", file.name);
    formData.append("file_object", file);
    formData.append("line_number", 1);
    formData.append("page_number", 1);
    const timestamp = Date.now();
    formData.append("timestamp", timestamp);

    // console.log(formData.get("file_name"));
    // console.log(formData.get("file_object"));
    // console.log(formData.get("line_number"));
    // console.log(formData.get("page_number"));
    // console.log(formData.get("timestamp"));

    try
    {
      setIsUploading(true);

      const response = await reauthenticatingFetch("POST", `${baseURL}/api/user/document-save`, formData, false);

      // Parse the text from the file and send it the text reader page
      const parsedText = await parseText(file);

      
      toReadingPage(file, parsedText);
    }
    catch(error)
    {
      console.error("Error uploading file: ", error);
      setIsUploading(false);
      setRetryConnection(2);
      setDocumentTiles([]);
    }   

  };

  const fileInputRef = useRef(null);

  // Function to handle button click and trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-swal-container {
        z-index: 1500; /* Set the desired z-index */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (allDocButtonState) {
      setRecentButtonState(false);
      setStarredButtonState(false);
      setDocumentTiles(sortAlphabetically(fileDetails));
    }
  }, [allDocButtonState]);

  useEffect(() => {
    if (recentButtonState) {
      setAllDocButtonState(false);
      setStarredButtonState(false);
      setDocumentTiles(sortByDate(fileDetails));
    }
  }, [recentButtonState]);

  useEffect(() => {
    if (starredButtonState) {
      setAllDocButtonState(false);
      setRecentButtonState(false);
      setDocumentTiles(filterStarred(fileDetails));
    }
  }, [starredButtonState]);

  // State to manage the menu's open/close state and the anchor element
  const [anchorEl, setAnchorEl] = useState(null);

  // Function to handle the opening of the menu
  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  // Determine if the menu is open
  const isMenuOpen = Boolean(anchorEl);

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
          backgroundColor: "#f1f1f1",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
            onClick={handleButtonClick}
            sx={{
              mt: 4,
              mb: 5,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: "white",
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(event) => {handleFileUpload(event.target.files[0])}}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
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
          <Button
            variant={allDocButtonState ? "contained" : "outlined"}
            onClick={() => setAllDocButtonState(true)}
            sx={{
              mt: 4,
              mb: 4,
              maxWidth: 175,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: allDocButtonState ? "" : "white",
            }}
          >
            All documents
          </Button>
          <Button
            variant={recentButtonState ? "contained" : "outlined"}
            onClick={() => setRecentButtonState(true)}
            startIcon={<AccessTime />}
            sx={{
              mb: 4,
              maxWidth: 175,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: recentButtonState ? "" : "white",
            }}
          >
            Recent
          </Button>
          <Button
            variant={starredButtonState ? "contained" : "outlined"}
            onClick={() => setStarredButtonState(true)}
            startIcon={<StarBorderRoundedIcon />}
            sx={{
              mb: 4,
              maxWidth: 175,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: starredButtonState ? "" : "white",
            }}
          >
            Starred
          </Button>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: "240px", mt: 2, position: "relative"}}>
        <Collapse in={showAlert} sx={{position: "absolute", top: 0, right: 0}}>
          <Alert variant="filled" severity="error" onClose={() => setShowAlert(false)}>
            An error occurred while processing the previous document. Please try again.
          </Alert>
        </Collapse>
        <Collapse in={isFetching & !isUploading} sx={{position: "absolute", top: showAlert ? "8vh" : 0, right: 0}}>
          <Alert variant="filled" severity="info">
            Fetching and parsing selected file...
          </Alert>
        </Collapse>
        <Collapse in={isUploading & !isFetching} sx={{position: "absolute", top: showAlert ? "8vh" : 0, right: 0}}>
          <Alert variant="filled" severity="info">
            Uploading and parsing file...
          </Alert>
        </Collapse>
        <Collapse in={(isDeleting === 1) & !isFetching & !isUploading} sx={{position: "absolute", top: showAlert ? "8vh" : 0, right: 0}}>
          <Alert variant="filled" severity="info">
            Deleting file...
          </Alert>
        </Collapse>
        <Collapse in={(isDeleting === 0) & !isFetching & !isUploading} sx={{position: "absolute", top: showAlert ? "8vh" : 0, right: 0}}>
          <Alert variant="filled" severity="success" onClose={() => {setIsDeleting(-1)}}>
            File deleted successfully
          </Alert>
        </Collapse>
        <Collapse in={retryConnection === 2} sx={{position: "absolute", top: showAlert ? "8vh" : 0, right: 0}}>
          <Alert variant="filled" severity="error">
            Operation failed. Please check your internet connection and try again.
          </Alert>
        </Collapse>
        <Collapse in={retryConnection === 1} sx={{position: "absolute", top: showAlert ? "8vh" : 0, right: 0}}>
          <Alert variant="filled" severity="info">
            Retrieving files...
          </Alert>
        </Collapse>
        <Typography
          variant="h2"
          gutterBottom
          sx={{ textAlign: "center", mb: 5, userSelect: "none" }}
        >
          Welcome to your drive
        </Typography>
        <TextField
          placeholder="Search for documents by name or file extension"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleEnterKeySearches}
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            marginLeft: "auto",
            marginRight: "auto",
            width: "60%",
            mb: 6,
            "& .MuiOutlinedInput-root": { borderRadius: "9999px" },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => showSearches(searchQuery)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
        />

        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
          <Typography variant="h4" sx={{ml: "2vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> { allDocButtonState ? "All documents" : recentButtonState ? "Recently opened" : "Your favourites"}</span></Typography>

          {/* IDK if we are going to convert the tiles into list as well, maybe for later. If so, need to add buttons to switch between both layouts */}
          {/* <Box sx={{display: "flex", alignItems: "center", mr: "2vw"}}>
            <Typography variant="h6" sx={{mr: "10vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> Total documents: {documentTiles.length} </span></Typography>

            <Typography variant="h6" sx={{mr: "10vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> Total documents: {documentTiles.length} </span></Typography>
          </Box> */}

          <Typography variant="h6" sx={{mr: "2vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> Total documents: {documentTiles.length} </span></Typography>

        </Box>

        <DragAndDropOverlay onUpload={handleFileUpload}/>

        { documentTiles.length !== 0 ? (
        <Grid2
          container
          spacing={3}
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {documentTiles.map((document, index) => (
            <Grid2 item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  maxWidth: "25vw",
                  border: "2px solid",
                  borderColor: "primary.main",
                  borderRadius: "30px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
                  width: "100%",
                }}
              >
                <CardHeader
                  title={<Typography variant="h6" noWrap sx={{ maxWidth: "17vw" }}>{document.name}</Typography>}
                  action={
                    <Tooltip
                      title={
                        document.isStarred
                          ? "Remove from Starred"
                          : "Add to Starred"
                      }
                      placement="bottom"
                    >
                      <IconButton onClick={() => changeStarredStatus(index)}>
                        {document.isStarred ? (
                          <StarRounded />
                        ) : (
                          <StarBorderRoundedIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Tooltip title={`Open ${document.name}`} placement="top">
                <CardMedia
                  height="200"
                  width="200"
                  component="img"
                  image={
                    document.thumbnail ? `data:image/jpeg;base64,${document.thumbnail}` : "/public/images/drive/Temp.png"
                  }
                  alt="Temp"
                  sx={{ userSelect: "none", cursor: "pointer", position: "sticky"}}
                  onClick={() => handleFileSelection(document.name)} // let user choose whether to go calibration or reading pages!!! - default option can be chosen in settings
                />
                </Tooltip>
                {/* TEMPORARY - Replace with menu asking whether to go directly to menu or calibration (depending on preferences set in settings)
                   Also use text from database instead of new upload */}
                <CardHeader
                  title={
                    <Typography variant="body2">
                      Last opened on {document.lastOpened}
                    </Typography>
                  }
                  action={
                    <div>
                      <Tooltip title="More options" placement="top">
                        <IconButton
                          onClick={(event) => handleMenuOpen(event, index)}
                        >
                          <MoreHoriz />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={anchorEl}
                        open={isMenuOpen && menuIndex === index}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                      >
                          <MenuItem onClick={() => handleRename(index, document.name.lastIndexOf('.') !== -1 ? document.name.substring(document.name.lastIndexOf('.')) : '')}>
                          <DriveFileRenameOutlineRoundedIcon
                            sx={{ mr: "1vw" }}
                          />
                          Rename
                        </MenuItem>
                        <MenuItem onClick={() => handleDelete(index)}>
                          <DeleteRoundedIcon sx={{ mr: "1vw" }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </div>
                  }
                />
              </Card>
            </Grid2>
          ))}
        </Grid2>
      ) : retryConnection <= 0  ? (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{backgroundColor: "white", height: "auto", padding: "2vh", margin: "2vh"}}>
          <Typography variant="h3" sx={{ marginBottom: "2vh", marginTop: "5vh"}}>No files found.</Typography>
          <Typography variant="h6"sx={{ marginBottom: "2vh"}}>Press the <span style={{color: "#06760D"}}>Upload</span> button or drop a file here.</Typography>
        </Box>
      ) : retryConnection === 1 ? (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{backgroundColor: "white", height: "auto", padding: "2vh", margin: "2vh"}}>
          <Typography variant="h4" sx={{ marginBottom: "2vh", marginTop: "5vh"}}>Fetching files. Please wait.</Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{backgroundColor: "white", height: "auto", padding: "2vh", margin: "2vh"}}>
          <Typography variant="h3" sx={{ marginBottom: "2vh", marginTop: "5vh"}}>Failed to fetch files.</Typography>
          <Typography variant="h7" sx={{ marginBottom: "2vh"}}>Please check your internet connection and try again.</Typography>
          <Button variant="contained" onClick={() => setRetryConnection(1)}>Reconnect</Button>
        </Box>
      )}
      </Box>
    </Box>
  );
}

export default DocumentDrivePage;
