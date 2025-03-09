import React, { useEffect, useState, useRef, useCallback } from "react";
import webgazer from "../webgazer/webgazer";
import { reauthenticatingFetch } from "../utils/api";

import { Box, Typography, LinearProgress, Container, Collapse, Alert, IconButton, CircularProgress, FormControlLabel, Checkbox, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { 
    ReplayRounded as ReplayRoundedIcon,
    VisibilityRounded as EyeRoundedIcon,
    FaceRounded as FaceRoundedIcon
} from "@mui/icons-material";

import Swal from "sweetalert2";

import config from '../config'
const baseURL = config.apiUrl

function DiagnosticPage()
{
    const canvasRef = useRef(null);
    const socket = useRef(null);

    const [connectionOpen, setStatusConn] = useState(false);
    
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setWebgazerLoading] = useState(true);
    const [webgazerFinished, setWebgazerFinished] = useState(false);

    const intervalRef = useRef(null);

    /* Diagnostic inputs*/
    const showFaceMesh = useRef(false);
    const showEyes = useRef(false);
    const showContours = useRef(false);
    const showAxes = useRef(true);

    const handleChange = (value) => {
        if(value == "face")
            showFaceMesh.current = !showFaceMesh.current;
        else if(value == "eyes")
            showEyes.current = !showEyes.current;
        else if(value == "contours")
            showContours.current = !showContours.current;
        else if(value == "axes")
            showAxes.current = !showAxes.current;
    };

    /* Diagnostic outputs*/

    // From frontend
    const [fpsValue, setFpsValue] = useState(null);

    // From backend

    // Filter for face or eye:
    const filter = useRef("face");

    /*
    Zoom level for the video frame (either show iris points zoomed in or out):
        False - Zoomed out (Show whole face)
        True - Zoomed in (Show cropped eye region)
    */
    const zoom = useRef(false);

    const handleZoom = () => {
        zoom.current = !zoom.current;
    };

    const handleFilterSelection = (event, newValue) => {
        if(newValue !== null && newValue !== filter.current)
            filter.current = newValue;
    };

    const [face_detected, setFaceDetected] = useState(null);
    const [yaw, setYaw] = useState(null);
    const [pitch, setPitch] = useState(null);
    const [roll, setRoll] = useState(null);
    const [face_speed, setFaceSpeed] = useState(null);

    
    const [left_iris_velocity, setLeftIrisVelocity] = useState(null);
    const [right_iris_velocity, setRightIrisVelocity] = useState(null);
    const [movement_type, setMovementType] = useState(null);

    /*
    Status of WebSocket connection (used for retrying connection and for showing alerts):
    -1 - Successful connection (message cleared)
    0 - Successful connection message
    1 - Connecting message
    2 - Lost connection message
    */
    const [retryConnection, setRetryConnection] = useState(1);

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

    // Webgazer initialisation
    useEffect(() => {
        const initializeWebGazer = async () => {

            document.getElementById("webgazerLoading").style.visibility  = "visible";

            webgazer.params.showVideo = false;
            webgazer.params.showGazeDot = false;
            webgazer.params.showVideoPreview = false;
            webgazer.params.saveDataAcrossSessions = false;
            webgazer.params.showFaceOverlay = false;
            webgazer.setRegression("weightedRidge");

            webgazer.begin(false)
                .then(() => {
                
                    // // Remove following sections if not showing gaze predictions for diagnostics
                    // try
                    // {
                    // if(localStorage.getItem("calibration") && localStorage.getItem("accuracy"))
                    // {
                    //     var calibrationData = JSON.parse(localStorage.getItem("calibration"));
                    //     webgazer.setRegressionData(calibrationData);
                    //     var accuracy = JSON.parse(localStorage.getItem("accuracy"));
                    // }
                    // else
                    // {
                    //     const responseMsg = await reauthenticatingFetch("GET",`${baseURL}/api/user/calibration-retrieval/`)
                    
                    //     if (!responseMsg.error) // if the JSON response contains an error, this means that no calibration data is found in database
                    //     {
                    //         var calibrationData = responseMsg.calibration_values;
                    //         webgazer.setRegressionData(calibrationData);
                    //     }
                    // }
                    
                    // }
                    // catch(error)
                    // {
                    // console.error("Failed to load calibration data from localStorage:", error);
                    // }

                    setWebgazerLoading(false);
                    setWebgazerFinished(true);
                    console.log("WebGazer initialized successfully");
                })
                .catch((err) => {
                    console.error("Failed to initialize WebGazer:", err);
                    setWebgazerFinished(true);
                    document.getElementById("webgazerLoading").style.visibility  = "hidden";
                    // Show alert for user to enable camera permissions
                    Swal.fire({
                        title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Failed to start Webgazer</span>',
                        html: `
                        <p style="font-family: Arial, sans-serif; font-size: 18px; color: black; user-select: none">Webcam not detected or disabled</p>
                        <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none, margin-top: 2vh">
                          <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; height: auto; user-select: none">
                          <div style="margin-left: 2vh; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
                            <p>Please check if your webcam is <span style="font-weight: bold">enabled and connected</span>. A webcam is required for this website.</p>
                            <p style="margin-top: 2vh;">If your webcam is enabled and connected, please check and allow your <span style="font-weight: bold">browser's camera permissions</span>.</p>
                          </div>
                        </div>
                      `,
                        icon: 'warning',
                        iconColor: 'orange',
                        width: '40vw',
                        confirmButtonColor: "#06760D",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        confirmButtonText: '<span style="user-select: none; padding: 0">Restart Webgazer</span>',
                        customClass: {
                          container: 'custom-swal-container', // Apply the custom class
                        },
                        willClose: async () => {
                          setWebgazerFinished(false);

                          document.getElementById("webgazerLoading").style.visibility  = "visible";
                        }
                    });
                });
    };

    if(isLoading && !webgazerFinished)
        initializeWebGazer();

    }, [isLoading, webgazerFinished]);

    // WebSocket connection
    const connectWebSocket = async () => {
        setRetryConnection(1);
        const token = localStorage.getItem("authTokens"); // Assuming token is stored in localStorage

        const cleanBaseURL = baseURL.replace(/^https?:\/\//, ""); // remove 'http://' or 'https://' from baseURL when connecting using WebSocket
        
        if(config.debug)
            socket.current = new WebSocket(`ws://${cleanBaseURL}/ws/video/?token=${token}`);
        else
            socket.current = new WebSocket(`wss://${cleanBaseURL}/ws/video/?token=${token}`);

        // console.log("Connecting to WebSocket...");

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Selected filter:", filter.current);
            if (data.mode === "diagnostic") {
                if(filter.current === "face")
                {
                    const { frame, face_detected, yaw, pitch, roll, face_speed } = data;
                    // Handle the received data, e.g., update state or perform actions
                    // console.log("Received frame:", frame);
                    // console.log("Face detected:", face_detected);
                    // console.log("Yaw:", yaw);
                    // console.log("Pitch:", pitch);
                    // console.log("Roll:", roll);
                    // console.log("Eye speed:", face_speed);

                    drawImageOnCanvas(frame);
                    setFaceDetected(face_detected);
                    setYaw(yaw);
                    setPitch(pitch);
                    setRoll(roll);
                    setFaceSpeed(face_speed);
                }
                else
                {
                    const { frame, face_detected, left_iris_velocity, right_iris_velocity, movement_type } = data;

                    // console.log("Received frame:", frame);
                    // console.log("Face detected:", face_detected);
                    // console.log("Left iris velocity:", left_iris_velocity);
                    // console.log("Right iris velocity:", right_iris_velocity);
                    // console.log("Movement type:", movement_type);

                    drawImageOnCanvas(frame);
                    setFaceDetected(face_detected);
                    setLeftIrisVelocity(left_iris_velocity);
                    setRightIrisVelocity(right_iris_velocity);
                    setMovementType(movement_type);
                }
            }
        };

        socket.current.onopen = () => {
        setRetryConnection(0);
        setStatusConn(true);
        }

        socket.current.onclose = async(event) => {
            socket.current = null;
            setStatusConn(false);
            setRetryConnection(2);
        };

        socket.current.onerror = async(event) => {
        await reauthenticatingFetch("GET", `${baseURL}/api/user/profile/`);
        console.log("Reconnecting to WebSocket...");
        connectWebSocket(); // Retry WebSocket connection after refreshing the access token using above request
        // toNotAuthorized();
        };
    };

    useEffect(() => {

        if(retryConnection > 0)
        {
            const canvas = canvasRef.current;
            if (canvas) {
            const ctx = canvas.getContext('2d');

            // Load the image
            const image = new Image();
            image.src = "../../public/images/diagnostics/NoConnection.svg";
            image.onload = () => {
                // Calculate the position to place the image in the middle
                const x = (canvas.width - image.width) / 2;
                const y = (canvas.height - image.height) / 2;

                // Draw the image in the middle of the canvas
                ctx.drawImage(image, x, y);
                };
            }
            
            
        }
        else if(retryConnection !== -1)
        {
            const canvas = canvasRef.current;
            if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

    }, [retryConnection]); // Also add check if camera permission is false

    const drawImageOnCanvas = (base64Image) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = base64Image;
    };

    useEffect(() => {
        if (!socket.current && !isLoading && webgazerFinished) {
        connectWebSocket();
        }

        return () => {
        if (socket.current) {
            socket.current.close();
            socket.current = null;
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        };
    }, [isLoading]);

    var total_frames = 0;
    var previous_frame = 0;
    var previous_time = 0;

    // Initialize state for previous frame data URL
    const previousFrameDataUrl = useRef(null);


    const sendVideoFrame = useCallback(async (xCoord, yCoord, canvas) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        const timestamp = Date.now(); // Get current timestamp of current frame
        const frame = canvas.toDataURL("image/jpeg");

        // Compare current frame with the previous frame
        if (frame !== previousFrameDataUrl.current) {

        // Send the frame via WebSocket
        socket.current.send(
            JSON.stringify({
            frame: frame,
            timestamp: timestamp,
            xCoordinatePx: xCoord,
            yCoordinatePx: yCoord,
            draw_mesh: showFaceMesh.current,
            draw_contours: showContours.current,
            show_axis: showAxes.current,
            draw_eye: showEyes.current,
            mode: "diagnostic",
            filter: filter.current,
            zoom: zoom.current
            })
        );

        total_frames += 1;
        if (total_frames === 1) {
            previous_time = timestamp;
            previous_frame = total_frames;
        }
        if (total_frames % 30 === 0) {
            window.console.log("Frames sent: ", total_frames, "Timestamp: ", timestamp, "X: ", xCoord, "Y: ", yCoord);
            const FPS = (total_frames - previous_frame) / ((timestamp - previous_time) / 1000);
            setFpsValue(FPS);
            // console.log("FPS: ", FPS);
            previous_frame = total_frames;
            previous_time = timestamp;
        }

        // Update the previous frame data URL
        previousFrameDataUrl.current = frame;
        }

        // handleYCoord(yCoord);
    }
    else
    {
        // console.error("WebSocket connection no longer open.");
        setStatusConn(false);
        webgazer.clearGazeListener();
    }
    }, []);

    const gazeListener = (data, canvas) => {
    if (data) {
        sendVideoFrame(data.x, data.y, canvas);
    } else {
        sendVideoFrame(null, null, canvas);
    }
    };

    useEffect(() => {
    if (connectionOpen) {
        webgazer.setGazeListener(gazeListener);
    }
    else
    {
        if(retryConnection !== 1)
        setRetryConnection(2);
    }
    }, [connectionOpen, sendVideoFrame]);

    if (isLoading) {
        return (
        <div
            id="webgazerLoading"
            style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f9f9f9",
            userSelect: "none"
            }}
        >
            <Typography variant="h5" style={{ marginBottom: "2vh" }}>
            Loading WebGazer...
            </Typography>
            <LinearProgress
            style={{ width: "80%", marginTop: "2vh" }}
            />
        </div>
        );
    }

        return (
        <Box style={{marginTop: "15vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
            <Collapse in={retryConnection === 0} sx={{position: "absolute", top: "15vh", right: "5vh"}}>
            <Alert variant="filled" severity="success" onClose={() => setRetryConnection(-1)}>
                Connection to server successful.
            </Alert>
            </Collapse>
            <Collapse in={retryConnection === 1} sx={{position: "absolute", top: "15vh", right: "5vh"}}>
            <Alert variant="filled" severity="info">
                Connecting...
            </Alert>
            </Collapse>
            <Collapse in={retryConnection === 2} sx={{position: "absolute", top: "15vh", right: "5vh"}}>
            <Alert variant="filled" severity="error" 
            action={
                <IconButton onClick={() => connectWebSocket()} color="inherit" size="small"><ReplayRoundedIcon fontSize="small"/></IconButton>
            }>
                Connection lost. Click here to retry.
            </Alert>
            </Collapse>
            <Typography variant="h3" style={{textAlign: "center"}}>Diagnostics</Typography>
            <Typography variant="h6" style={{textAlign: "center"}}>Verify if your camera, head tracking, and eye tracking are working properly here.</Typography>

            <Box style={{display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "5vh"}}>
            <Container style={{width: "50vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                <canvas ref={canvasRef} width={640} height={480} style={{borderRadius: "5px", border: "1px solid #ccc", maxWidth: "50vw", backgroundColor: "#d9d9d9"}}></canvas>
            </Container>
            <Container style={{width: "50vw", maxWidth: "50vw", display: "flex", flexDirection: "column"}}>
                <Typography variant="h6">
                    Frames per second (FPS): <span style={{ fontFamily: "monospace", fontSize: "14pt", color: fpsValue <= 15 ? "red" : fpsValue <= 25 ? "orange" : "red" }}> {retryConnection <= 0 ? fpsValue === null  ? "Calculating..." : `${fpsValue.toFixed(0)} FPS` : "No value"}</span>
                </Typography>

                <Box display="flex" flexDirection="row" mt={"2vh"} mb={"2vh"} style={{minWidth: "40vw", flexWrap: "wrap"}}>
                    <Typography variant="h6" mr={"2vw"}>Filter frame by: </Typography>
                    <ToggleButtonGroup
                        color="primary"
                        value={filter.current}
                        exclusive
                        disabled={retryConnection > 0}
                        onChange={handleFilterSelection}>
                        <ToggleButton value="face">
                            <FaceRoundedIcon/>
                        </ToggleButton>
                        <ToggleButton value="eye">
                            <EyeRoundedIcon/>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Typography variant="h6" mt={"2vh"}>
                    Face detected? { retryConnection <= 0 ? face_detected === 1 ? <span style={{ fontFamily: "monospace", color: "green" }}>TRUE</span> : <span style={{ fontFamily: "monospace", color: "red" }}>FALSE</span> : <span style={{fontFamily: "monospace"}}>No value</span> }
                </Typography>

                { filter.current === "face" ? 
                    (
                        <Box>
                            <Typography variant="h5" mt={"5vh"}>Head tracking</Typography>

                            <Box display="flex" flexDirection="row" mt={"2vh"} style={{minWidth: "40vw", flexWrap: "wrap"}}>
                                <FormControlLabel control={<Checkbox checked={showFaceMesh.current} disabled={retryConnection > 0} onChange={() => handleChange("face")}/>} label="Show face mesh" />
                                <FormControlLabel control={<Checkbox checked={showEyes.current} disabled={retryConnection > 0} onChange={() => handleChange("eyes")}/>} label="Show eye points" />
                                <FormControlLabel control={<Checkbox checked={showContours.current} disabled={retryConnection > 0} onChange={() => handleChange("contours")}/>} label="Show contours" />
                                <FormControlLabel control={<Checkbox checked={showAxes.current} disabled={retryConnection > 0} onChange={() => handleChange("axes")}/>} label="Show axes" />
                            </Box>

                            <Box display="flex" gap={2} mt={"2vh"} style={{ minWidth: "40vw", flexWrap: "wrap" }}>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>Pitch: </span> 
                                    <span style={{ fontFamily: "monospace", display: "inline-block", width: "14ch", fontSize: "14pt" }}>{pitch === null || pitch === undefined  || retryConnection > 0 ? "No value" : pitch.toFixed(5)}</span>
                                </Typography>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>Yaw: </span> 
                                    <span style={{ fontFamily: "monospace", display: "inline-block", width: "14ch", fontSize: "14pt" }}>{yaw === null || yaw === undefined  || retryConnection > 0  ? "No value" : yaw.toFixed(5)}</span>
                                </Typography>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>Roll: </span> 
                                    <span style={{ fontFamily: "monospace", display: "inline-block", width: "14ch", fontSize: "14pt"}}>{roll === null || roll === undefined  || retryConnection > 0  ? "No value" : roll.toFixed(5)}</span>
                                </Typography>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>Face movement velocity: </span> 
                                    <span style={{ fontFamily: "monospace", display: "inline-block", width: "14ch", fontSize: "14pt"}}>{face_speed === null || face_speed === undefined  || retryConnection > 0  ? "No value" : face_speed.toFixed(5)}</span>
                                </Typography>
                            </Box>
                        </Box>
                    )
                    :
                    (
                        <Box>
                            <Typography variant="h5" mt={"5vh"}>Eye tracking</Typography>

                            <Box display="flex" flexDirection="row" mt={"2vh"} style={{minWidth: "40vw", flexWrap: "wrap"}}>
                                <FormControlLabel control={<Checkbox checked={zoom.current} disabled={retryConnection > 0} onChange={() => handleZoom()}/>} label="Zoom into eye region" />
                            </Box>

                            <Box display="flex" gap={2} mt={"2vh"} style={{ minWidth: "40vw", flexWrap: "wrap" }}>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>Left eye velocity: </span> 
                                    <span style={{ fontFamily: "monospace", display: "inline-block", width: "14ch", fontSize: "14pt" }}>{left_iris_velocity === null || left_iris_velocity === undefined  || retryConnection > 0  ? "No value" : left_iris_velocity.toFixed(5)}</span>
                                </Typography>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>Right eye velocity: </span> 
                                    <span style={{ fontFamily: "monospace", display: "inline-block", width: "14ch", fontSize: "14pt" }}>{right_iris_velocity === null || right_iris_velocity === undefined  || retryConnection > 0  ? "No value" : right_iris_velocity.toFixed(5)}</span>
                                </Typography>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>Eye movement type: </span> 
                                    <span style={{ fontFamily: "monospace", display: "inline-block", width: "14ch", fontSize: "14pt"}}>{movement_type === null || movement_type === undefined || retryConnection > 0 ? "No value" : movement_type}</span>
                                </Typography>
                            </Box>
                        </Box>
                    )
                }
            </Container>
            </Box>
        </Box>
        );
}

export default DiagnosticPage;