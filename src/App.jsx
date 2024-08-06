import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

const App = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // LOAD MODELS FROM FACE API

  const loadModels = () => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      console.log("load models"),
    ]).then(() => {
      faceMyDetect();
    });
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      console.log("draw canvas ");
      faceapi.matchDimensions(canvasRef.current, {
        width: 555,
        height: 650,
      });

      const resized = faceapi.resizeResults(detections, {
        width: 555,
        height: 650,
      });

      faceapi.draw.drawDetections(canvasRef.current, resized);

      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }, 100);
  };

  return (
    <main className="App">
      <div className="Cam">
        <video ref={videoRef} autoPlay crossOrigin="anonymous"></video>
      </div>
      <canvas
        ref={canvasRef}
        width={"555"}
        height={"650"}
        style={{ position: "absolute" }}
      ></canvas>
    </main>
  );
};

export default App;
