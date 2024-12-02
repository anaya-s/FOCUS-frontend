import { useState, useEffect, useRef } from "react";
import webgazer from "../webgazer/webgazer.js";

const videoStyle = {marginTop: "300px"}

function Temp() {
  const videoRef = useRef(null);
  const socket = useRef(null);
  const [stream, setStream] = useState(null);
  const [streamObtained, changeStatus] = useState(false);
  const [connectionOpen, changeStatusConn] = useState(false);
  const [framesData, setFramesData] = useState([]); // TO DO - Array to store frame data with timestamps

  const intervalRef = useRef(null);

  useEffect(() => {
    webgazer.begin();

    webgazer.params.showVideo = false;
    webgazer.params.showGazeDot = true;
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

  const sendVideoFrame = () => {
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
        { frame: frame, timestamp: timestamp },
      ]);

      // Send the frame via WebSocket
      socket.current.send(
        JSON.stringify({
          frame: frame,
          timestamp: timestamp
        })
      );
    }
  };

  useEffect(() => {
    if (stream && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        sendVideoFrame();
      }, 0); // interval time doesn't matter for some reason, the latency calculated at backend is always the same regardless of this interval value
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamObtained && connectionOpen]);

  return (
    <div style={videoStyle}>
      <video ref={videoRef} autoPlay width="700" height="700"></video>
    </div>
  );
}

export default Temp;