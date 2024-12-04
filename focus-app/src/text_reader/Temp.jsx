import { useState, useEffect, useRef } from "react";
import webgazer from "../webgazer/webgazer.js";

const videoStyle = {marginTop: "300px"}

function Temp() {
  const videoRef = useRef(null);
  const socket = useRef(null);
  const [stream, setStream] = useState(null);
  const [streamObtained, changeStatus] = useState(false);
  const [connectionOpen, changeStatusConn] = useState(false);
  const [framesData, setFramesData] = useState([]);

  const intervalRef = useRef(null);

  useEffect(() => {
    webgazer.begin();

    webgazer.params.showVideo = false;
    webgazer.params.showGazeDot = false;
    webgazer.params.showVideoPreview = false;
    webgazer.params.saveDataAcrossSessions = false;

    /* Fetch the video stream from Webgazer */
    const intervalId = setInterval(() => {
      const stream = webgazer.getVideoStream();
      if (stream !== null) {
        setStream(stream);
        changeStatus(true);
        videoRef.current.srcObject = stream;
        clearInterval(intervalId); // Stop checking once stream is available
      }
    }, 500);

    // Cleanup when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && !socket.current) {
      const token = localStorage.getItem("authTokens"); // Assuming token is stored in localStorage
      socket.current = new WebSocket(`ws://localhost:8000/ws/video/?token=${token}`);

      socket.current.onopen = () => changeStatusConn(true);
      socket.current.onclose = () => {
        socket.current = null;
        changeStatusConn(false);
      };
      socket.current.onerror = (error) => {
        console.error("Ensure that the server is running.");
      };
    }

    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamObtained]);

  const sendVideoFrame = (xCoord, yCoord) => {
    if (
      videoRef.current &&
      socket.current &&
      socket.current.readyState === WebSocket.OPEN
    ) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth // 640p
      canvas.height = videoRef.current.videoHeight // 480p
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const timestamp = Date.now(); // Get current timestamp of current frame

      const frame = canvas.toDataURL("image/jpeg");

      // Store image data and timestamp in framesData array
      setFramesData((prevFrames) => [
        ...prevFrames,
        { frame: frame, timestamp: timestamp, xCoordinatePx: xCoord, yCoordinatePx: yCoord},
      ]);

      // Send the frame via WebSocket
      socket.current.send(
        JSON.stringify({
          frame: frame,
          timestamp: timestamp,
          xCoordinatePx: xCoord,
          yCoordinatePx: yCoord
        })
      );
    }
  };

  useEffect(() => {
    if (stream && !intervalRef.current) {

      webgazer.setGazeListener((data) => { /* Start gaze coordinate tracker and obtain gaze coordinates */
        if (data) {
          webgazer.util.bound(data);
          var xPrediction = data.x; // Horizontal gaze coordinate
          var yPrediction = data.y; // Vertical gaze coordinate
          sendVideoFrame(xPrediction,yPrediction); // Send coordinates data with frame
        }
        else
          sendVideoFrame(); // Send no coordinates with frame if face is not detected
      }).begin();
    }
  }, [streamObtained]);

  return (
    <div style={videoStyle}>
      <video ref={videoRef} autoPlay width="700" height="700" style={{display: 'none'}}></video>
    </div>
  );
}

export default Temp;