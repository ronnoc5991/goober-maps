import logDuringDev from "./utils/logDuringDev";
import onDrag from "./utils/onDrag";

import "./style.css";

const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
// const drawingContext = canvasElement.getContext("2d");

function resizeCanvasToFillViewport() {
  const { innerWidth, innerHeight } = window;
  canvasElement.width = innerWidth;
  canvasElement.height = innerHeight;
}

resizeCanvasToFillViewport();
window.addEventListener("resize", resizeCanvasToFillViewport);

const position = { latitude: 0, longitude: 0 };

onDrag({
  draggableElement: canvasElement,
  dragThreshold: 3,
  callback: (delta) => {
    position.latitude += delta.y;
    position.longitude += delta.x;
    logDuringDev("coordinates: ", position.latitude, position.longitude);
  },
});
