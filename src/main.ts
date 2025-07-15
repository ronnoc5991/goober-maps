import onDrag from "./utils/onDrag";

import "./style.css";

// TODO: create a 'dev mode' that will draw the vertices for me and label them?

// FINDINGS: drawing the images COULD work... might have to optimize if speed becomes an issue
// NOTE: if a vertex is visible, all 4 images around it are necessary

// important to note: this is in viewport units
function drawVertex(x: number, y: number) {
  const { offsetWidth, offsetHeight } = canvasElement;

  drawingContext.beginPath();
  // these do not take the focal point into account...
  // map unit x, offset by the canvas width, but also take the focal point into account?
  const translatedX = x + offsetWidth / 2 + focalPoint.x;
  const translatedY = y + offsetHeight / 2 + focalPoint.y;

  drawingContext.arc(translatedX, translatedY, 2, 0, 2 * Math.PI);
  drawingContext.stroke();
  drawingContext.fillText(`(${x}, ${y})`, translatedX + 3, translatedY - 3);
}

// HOW DO YOU KNOW WHAT IS VISIBLE?
// where are we looking (focal point in map units)
// how far away from that can we see in either dimension (viewport units converted into map units)
// calculate all of the things within that range?

// translate width of viewport to map units? (how wide is our window?)
// translate viewport dimensions to window dimensions? viewport = 1000 x 500... window = 500 x 250

// 50 viewport pixels is equal to 1 degree of map longitude/latitude?

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

function resizeCanvasToFillViewport() {
  const { innerWidth, innerHeight } = window;
  canvasElement.width = innerWidth;
  canvasElement.height = innerHeight;
}

function clearCanvas({
  canvas,
  context,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}) {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
}

function drawMap() {
  clearCanvas({
    canvas: canvasElement,
    context: drawingContext,
  });

  const windowBounds = computeWindowBounds();
  const visibleVertices = computeVisibleVertices(windowBounds);

  visibleVertices.forEach(([x, y]) => {
    drawVertex(x, y);
  });
}

function onWindowResize() {
  resizeCanvasToFillViewport();
  drawMap();
}

onWindowResize();
window.addEventListener("resize", onWindowResize);

// given the canvas' dimensions (and eventually the zoom level)
// determine which vertices (could be a tuple) are visible and return them?

// I NEED A SUB-CELL_SIZE FOCAL POINT UNIT

// which map units are visible?  Which map units 'require' vertices?
// for now, the map units are 1:1 with the viewport units
// so focalPoint.x - canvas.width / 2 is the min x
// a function that determines the minx, miny, maxx and maxy of the window
// { x: -3 }
function computeWindowBounds() {
  // the window bounds are the bounds of the visible part of the map
  // in other words, this is where the first conversion from viewport to map takes place?
  // we know the viewport dimensions, then we want to translate those to the map coordinates
  const halfCanvasWidth = canvasElement.offsetWidth / 2;
  const halfCanvasHeight = canvasElement.offsetHeight / 2;

  return {
    // -3 - 720 = -723
    // -3 - 720 = -717
    minX: -halfCanvasWidth - focalPoint.x,
    maxX: halfCanvasWidth - focalPoint.x,
    minY: -halfCanvasHeight - focalPoint.y,
    maxY: halfCanvasHeight - focalPoint.y,
  };
}

// find min-max x and min-max y of map
function computeVisibleVertices(windowBounds: {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}) {
  // I think we actually want the COORDINATES of the top-left and bottom-right corners of the window
  // then we can determine exactly what vertices are within that range
  // this is to say... we need to now figure out which vertices fall within these things...
  // do we have some sort of 'list' of all existing vertices?
  // or do we know that they follow some pattern (every 100th thing?)
  // for now, let's do the pattern following

  // find the first value that is greater than the minX to draw a vertex at
  // this also requires that we look at the minY to try and find out where the first vertex is there...

  // TODO: think about the behavior of this rounding
  const firstValidXValue = Math.round(windowBounds.minX / 100) * 100;

  const firstValidYValue = Math.round(windowBounds.minY / 100) * 100;

  // these are vertices relative to the focal point...
  const vertices: Array<[number, number]> = [];

  for (let x = firstValidXValue; x <= windowBounds.maxX; x += 100) {
    for (let y = firstValidYValue; y <= windowBounds.maxY; y += 100) {
      vertices.push([x, y]);
    }
  }

  return vertices;
}

// FOR NOW: 1px = 1/100 of a degree long/lat
// that means to convert focal point to long/lat, we have to divide each one by 100

// Run with the idea of translating between MAP units and VIEWPORT Units
// right now they can be 1:1
onDrag({
  draggableElement: canvasElement,
  dragThreshold: 3,
  callback: (delta) => {
    // the deltas are in pixel values...
    // the focalPoint is in map units...
    // right now this is a 1:1 translation...
    // but
    focalPoint.y -= delta.y;
    focalPoint.x -= delta.x;
    drawMap();
  },
});
