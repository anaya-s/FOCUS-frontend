import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography } from "@mui/material";
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

export const DragAndDropOverlay = ({ onUpload }) => {
    const onDrop = useCallback((event) => performUpload(event));
  
    const { getRootProps, getInputProps, isDragActive, isDragAccept} = useDropzone({
      onDrop,
      accept: {
        "application/pdf": ['.pdf'],
        "text/plain": ['.txt'],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ['.docx'],
      },
      multiple: false,
      noClick: true,
    });

    const performUpload = async(event) => {
        if(isDragAccept)
        {
            const file = await event[0].handle.getFile();
            onUpload(file);
        }
    };
  
    return (
      <Box
        {...getRootProps()}
        sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "70%",
            bgcolor: isDragActive ? "rgba(0, 119, 255, 0.25)" : "transparent",
            border: isDragActive ? "2px dashed #0077FF" : "none",    
            zIndex: isDragActive ? 1000 : 0,      
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
      >
        <input {...getInputProps()}/>
        {isDragActive && (
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"}}>
          <CloudUploadRoundedIcon sx={{fontSize: "80px", textShadow: "2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white", color: "black", backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "5px", padding: "5px", opacity: "20"}}/>
          <Typography variant="h2" sx={{mt: "1vh", textShadow: "2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white", color: "black"}}>
            Drop files here to upload
          </Typography>
          <Typography variant="h4" sx={{mt: "1vh", textShadow: "2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white", color: "black"}}>
            .pdf .docx .txt
          </Typography>
        </Box>
        )}
      </Box>
    );
  };