import onDrag from "./utils/onDrag";

import "./style.css";
// TODO: create a 'dev mode' that will draw the vertices for me and label them?

// FINDINGS: drawing the images COULD work... might have to optimize if speed becomes an issue
// NOTE: if a vertex is visible, all 4 images around it are necessary

// (x - xmin) / (xmax - xmin)
// (y - ymin) / (ymax - ymin)
type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type Coordinates = { x: number; y: number };

function normalizeCoordinates({
  coordinates,
  bounds,
}: {
  coordinates: Coordinates;
  bounds: Bounds;
}) {
  return {
    x: (coordinates.x - bounds.minX) / (bounds.maxX - bounds.minX),
    y: (coordinates.y - bounds.minY) / (bounds.maxY - bounds.minY),
  };
}

function viewportToWindowCoordinates({
  viewportCoordinates,
  viewportBounds,
  windowBounds,
}: {
  viewportCoordinates: Coordinates;
  viewportBounds: Bounds;
  windowBounds: Bounds;
}) {
  const normalizedCoordinates = normalizeCoordinates({
    coordinates: viewportCoordinates,
    bounds: viewportBounds,
  });

  const windowCoordinates = normalizedToWindowCoordinates({
    normalizedCoordinates,
    windowBounds,
  });

  return windowCoordinates;
}

function windowToViewportCoordinates({
  windowCoordinates,
  windowBounds,
  viewportBounds,
}: {
  windowCoordinates: Coordinates;
  viewportBounds: Bounds;
  windowBounds: Bounds;
}) {
  const normalizedCoordinates = normalizeCoordinates({
    coordinates: windowCoordinates,
    bounds: windowBounds,
  });

  const viewportCoordinates = normalizedToViewportCoordinates({
    normalizedCoordinates,
    viewportBounds,
  });

  return viewportCoordinates;
}

function normalizedToViewportCoordinates({
  normalizedCoordinates,
  viewportBounds,
}: {
  normalizedCoordinates: { x: number; y: number };
  viewportBounds: Bounds;
}) {
  return {
    x: normalizedCoordinates.x * (viewportBounds.maxX - viewportBounds.minX),
    y: normalizedCoordinates.y * (viewportBounds.maxY - viewportBounds.minY),
  };
}

function normalizedToWindowCoordinates({
  normalizedCoordinates,
  windowBounds,
}: {
  normalizedCoordinates: { x: number; y: number };
  windowBounds: Bounds;
}) {
  return {
    x: normalizedCoordinates.x * (windowBounds.maxX - windowBounds.minX),
    y: normalizedCoordinates.y * (windowBounds.maxY - windowBounds.minY),
  };
}

const SCALE_FACTOR = 1;
// multiply the pixels
// 1000px / 1 = 1000 (this is as zoomed in as we get?)
// 1000px / 2 = 500 (things are half as big as they are in real life)

// I want to draw the window onto the viewport...
// I know the viewport's dimensions
// I know where I want to 'focus' on the map (coordinates)

// given a point to focus on, the viewport's dimensions and a zoom level (scale viewport units to map units?)
// if I have 1000 viewport pixels and I want to show 1000 map units, the scale is 1:1?
// how many px are used per map unit?
// how many map units per px? (1 = 1:1 scale) (10 = 1:10 scale?)

// I have a focal point...
// how does translation (dragging) work with this stuff?

function computeViewportBounds() {
  const { offsetWidth: viewportWidth, offsetHeight: viewportHeight } =
    canvasElement;

  return {
    minX: 0,
    maxX: viewportWidth,
    minY: 0,
    maxY: viewportHeight,
  };
}

function computeWindowBounds() {
  const { offsetWidth: viewportWidth, offsetHeight: viewportHeight } =
    canvasElement;

  const windowWidth = viewportWidth / SCALE_FACTOR;
  const windowHeight = viewportHeight / SCALE_FACTOR;

  return {
    minX: focalPoint.x - windowWidth / 2,
    maxX: focalPoint.x + windowWidth / 2,
    minY: focalPoint.y - windowHeight / 2,
    maxY: focalPoint.y + windowHeight / 2,
  };
}

// important to note: this is in viewport units
function drawVertex(coordinates: Coordinates, label?: string) {
  drawingContext.beginPath();
  drawingContext.arc(coordinates.x, coordinates.y, 2, 0, 2 * Math.PI);
  drawingContext.stroke();
  if (!label) return;
  drawingContext.fillText(label, coordinates.x + 3, coordinates.y);
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
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
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
  const viewportBounds = computeViewportBounds();
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
      drawVertex(
        vertex,
        `(${verticesInWindow[index].x}, ${verticesInWindow[index].y})`
      );
    });
}

function onWindowResize() {
  resizeCanvasToFillViewport();
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
