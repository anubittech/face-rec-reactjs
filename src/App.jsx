import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

const App = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [faceing, setFacing] = useState("user");
  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    console.log("FacingMode:", faceing);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: faceing } })
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
      // faceap
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      console.log("load models"),
    ]).then(() => {
      faceMyDetect();
    });
  };

  async function faceMyDetect() {
    const LabelFaceDetect = await LoadRefImage();
    console.log("LoadRefImage() run");

    const faceMatcher = new faceapi.FaceMatcher(LabelFaceDetect, 0.6);
    console.log("faceapi.FaceMatcher(LabelFaceDetect,0.6) run");
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // DRAW YOU FACE IN WEBCAM
      console.log("detection canvas ");
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
      let faceruslts = resized.map((d) =>
        faceMatcher.findBestMatch(d.detection)
      );
      faceruslts.forEach((result, i) => {
        const faceBox = resized[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(faceBox, {
          label: result.toString(),
        });
        drawBox.draw(canvasRef.current);
        console.log(`Detected: ${result.toString()}`);
      });
      faceapi.draw.drawDetections(canvasRef.current, resized);

      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }, 100);
  }
  const LoadRefImage = () => {
    // const Emplabels = ["Titas"];
    const Heroslabels = [
      "Black Widow",
      "Captain America",
      "Captain Marvel",
      "Iron Man",
      "Tony Stark",
      "Thor",
    ];
    return Promise.all(
      Heroslabels.map(async (labels) => {
        let descripions = [];
        for (let i = 1; i <= 2; i++) {
          let img = await faceapi.fetchImage(
            `/marvel_heros/${labels}/${i}.jpg`
          );
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detections) {
            descripions.push(detections.descriptor);
          }
          return new faceapi.LabeledFaceDescriptors(labels, descripions);
        }
      })
    );
  };
  return (
    <main className="App">
      <div className="Cam">
        <video ref={videoRef} autoPlay crossOrigin="anonymous"></video>
        <div className="BtnDiv">
          <button onClick={() => setFacing("user")}>Front Cam</button>
          <button onClick={() => setFacing("environment")}>Back Cam</button>
        </div>
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
