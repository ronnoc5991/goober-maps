import "./style.css";

// draw a circle in the middle of it
// make sure that repositions in the center on resizes?

const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

const drawingContext = canvasElement.getContext("2d");

function resizeCanvasToFillViewport() {
  const { innerWidth, innerHeight } = window;
  canvasElement.width = innerWidth;
  canvasElement.height = innerHeight;
}

resizeCanvasToFillViewport();

window.addEventListener("resize", resizeCanvasToFillViewport);
