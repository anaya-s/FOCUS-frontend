import React, { useState, useEffect, useRef } from "react";

import webgazer from "./webgazer.js"

function Login() {
  const videoRef = useRef(null);
  const socket = useRef(null);
  const [stream, setStream] = useState(null);
  const [streamObtained, changeStatus] = useState(false);
  const [connectionOpen, changeStatusConn] = useState(false);

  const intervalRef = useRef(null);
  
  useEffect(() => {

    webgazer.begin(); // Start Webgazer.js to get the video stream, and to enable eye tracking

    /* Setting parameters for Webgazer.js */
    webgazer.params.showVideo = false;
    webgazer.params.showGazeDot = true;
    webgazer.params.showVideoPreview = false;
    webgazer.params.saveDataAcrossSessions = false;

    /* Fetch the video stream from Webgazer */
    const intervalId = setInterval(() => {
      const stream = webgazer.getVideoStream();
  
      if (stream !== null) {
        // console.log("Got stream");
        setStream(stream); // Set your stream here
        changeStatus(true); // Update any state or flags as needed
        videoRef.current.srcObject = stream;
        clearInterval(intervalId); // Stop checking once we have the stream
      } 
      // else {
      //   console.log("Did not get video stream, retrying...");
      // }
    }, 500); // Check every 500 milliseconds
    
    // Cleanup when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Only run once on mount to get video stream

  useEffect(() => {
    if (stream && !socket.current) {
      // Only create the WebSocket connection once the stream is set
      socket.current = new WebSocket("ws://localhost:8000/ws/video/");

      socket.current.onopen = () => {
        console.log("WebSocket connection established");
        changeStatusConn(true);
      };

      socket.current.onclose = () => {
        console.log("WebSocket connection closed");
        socket.current = null; // Reset the socket reference on close
        changeStatusConn(false);
      };

      socket.current.onerror = (error) => {
        // console.error("WebSocket error:", error);
        console.error("Ensure that the server is running.");
      };
    }

    // Cleanup WebSocket and media stream on component unmount
    return () => {
      if (socket.current) {
        socket.current.close(); // Close the WebSocket connection
        socket.current = null; // Ensure socket is reset to null
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Stop the frame sending interval
      }
    };
  }, [streamObtained == true]); // Only run when stream is obtained

  const sendVideoFrame = () => {
    if (videoRef.current && socket.current && socket.current.readyState === WebSocket.OPEN) {
      const canvas = document.createElement("canvas");
      // canvas.width = videoRef.current.videoWidth; // 640px
      canvas.width = 320; // Testing lower resolutions
      // canvas.height = videoRef.current.videoHeight; // 480px
      canvas.height = 240; // Testing lower resolutions
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      console.log("Sending frame");

      // Convert the canvas image to Base64
      const frame = canvas.toDataURL("image/jpeg");

      // Send the frame via WebSocket
      socket.current.send(
        JSON.stringify({
          frame: frame,
        })
      );
    }
  };

  useEffect(() => {
    // Start sending frames every 100ms once stream is available
    if (stream && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        sendVideoFrame();
      }, 0); // Set interval between each frame in milliseconds
    }

    /* Observations on FPS limit:
    - 50ms interval between frame is the lowest limit - for frames to be received 'close' to real-time without delays
    - Any interval < 50ms introduces delays in receiving - front-end sending frames too quickly for back-end to receive and process them into images
    - However, the above applied to image resolution 640x480
    - If res is reduced to 320x240 (half image quality), the interval can be brought down to 0 ms (NO interval) !!!
    - Ultimately, both the interval and resolution depends on the the speed of the real-time processing of eye metrics and the necessary image quality for such processing.
     */

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Clean up the interval
      }
    };
  }, [streamObtained == true && connectionOpen == true]); // Only run when the stream is available

  return (
    <div>
      <video ref={videoRef} autoPlay width="1280" height="720"></video>
    </div>
  );
}

export default Login;