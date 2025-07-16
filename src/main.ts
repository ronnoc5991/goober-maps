import onDrag from "./utils/onDrag";
import {
  windowToViewportCoordinates,
  type Coordinates,
} from "./utils/coordinates";
import { clearCanvas, drawVertex } from "./utils/drawing";

import "./style.css";
import resizeCanvasToFillViewport from "./utils/resizeCanvasToFillViewport";

// TODO: create a 'dev mode' that will draw the vertices for me and label them?
// FINDINGS: drawing the images COULD work... might have to optimize if speed becomes an issue
// NOTE: if a vertex is visible, all 4 images around it are necessary

// divide the pixels by this factor?
// 1000px / 1 = 1000 (this is as zoomed in as we get?)
// 1000px / 2 = 500 (things are half as big as they are in real life)
const SCALE_FACTOR = 1;

function computeViewportBounds({ canvas }: { canvas: HTMLCanvasElement }) {
  const { offsetWidth: viewportWidth, offsetHeight: viewportHeight } = canvas;

  return {
    minX: 0,
    maxX: viewportWidth,
    minY: 0,
    maxY: viewportHeight,
  };
}

function computeWindowBounds({
  canvas,
  centerPoint,
  scaleFactor,
}: {
  canvas: HTMLCanvasElement;
  centerPoint: Coordinates;
  scaleFactor: number;
}) {
  const { offsetWidth: viewportWidth, offsetHeight: viewportHeight } = canvas;

  const windowWidth = viewportWidth / scaleFactor;
  const windowHeight = viewportHeight / scaleFactor;

  return {
    minX: centerPoint.x - windowWidth / 2,
    maxX: centerPoint.x + windowWidth / 2,
    minY: centerPoint.y - windowHeight / 2,
    maxY: centerPoint.y + windowHeight / 2,
  };
}

// 1. Determine which images need to be loaded (which ones are visible)
// 2. Determine where to draw each image and what size each image should be rendered at
// 3. Actually draw the images when they are loaded?
// knowing THAT we need to load an image is one part of the puzzle...
// AFTER it is loaded we can draw it... but it might no longer be necessary at that point in time...
// could just store a map of the image 'name' (location and size?) and the image along with an isLoaded state...

// IMAGE LOADING BASICS
// const testImage = new Image();

// testImage.onload = () => {
//   drawingContext.drawImage(testImage, -100, -100, 200, 200);
// };

// testImage.src = "https://picsum.photos/200";

const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const drawingContext = canvasElement.getContext(
  "2d"
) as CanvasRenderingContext2D;

drawingContext.font = "bold italic 8px Arial";

// these are in "MAP UNITS"
const focalPoint = { x: 0, y: 0 };

function drawMap() {
  clearCanvas({
    canvas: canvasElement,
    context: drawingContext,
  });

  const windowBounds = computeWindowBounds({
    canvas: canvasElement,
    centerPoint: focalPoint,
    scaleFactor: SCALE_FACTOR,
  });

  const viewportBounds = computeViewportBounds({ canvas: canvasElement });

  const verticesInWindow = computeVisibleVertices(windowBounds);

  verticesInWindow
    .map((vertex) =>
      windowToViewportCoordinates({
        windowCoordinates: vertex,
        windowBounds,
        viewportBounds,
      })
    )
    .forEach((vertex, index) => {
      drawVertex({
        coordinates: vertex,
        drawingContext,
        label: `(${verticesInWindow[index].x}, ${verticesInWindow[index].y})`,
      });
    });
}

function onWindowResize() {
  resizeCanvasToFillViewport({ canvas: canvasElement });
  drawMap();
}

onWindowResize();
window.addEventListener("resize", onWindowResize);

// TODO: get rid of magic numbers here!!!
function computeVisibleVertices(windowBounds: {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}) {
  // do we have some sort of 'list' of all existing vertices?
  // or do we know that they follow some pattern (every 100th thing?)
  // for now, let's do the pattern following

  // TODO: think about the behavior of this rounding
  const firstValidXValue = Math.round(windowBounds.minX / 100) * 100;

  const firstValidYValue = Math.round(windowBounds.minY / 100) * 100;

  // these are vertices relative to the focal point...
  const vertices: Array<Coordinates> = [];

  for (let x = firstValidXValue; x <= windowBounds.maxX; x += 100) {
    for (let y = firstValidYValue; y <= windowBounds.maxY; y += 100) {
      vertices.push({ x, y });
    }
  }

  return vertices;
}

onDrag({
  draggableElement: canvasElement,
  dragThreshold: 3,
  callback: (delta) => {
    // TODO: are these correctly scaled from viewport to map units?
    focalPoint.y += delta.y / SCALE_FACTOR;
    focalPoint.x += delta.x / SCALE_FACTOR;
    drawMap();
  },
});
