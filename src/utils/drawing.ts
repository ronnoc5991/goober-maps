import type { Coordinates } from "./coordinates";

export function clearCanvas({
  canvas,
  context,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}) {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
}

export function drawVertex({
  coordinates,
  drawingContext,
  label,
}: {
  coordinates: Coordinates;
  drawingContext: CanvasRenderingContext2D;
  label?: string;
}) {
  drawingContext.beginPath();
  drawingContext.arc(coordinates.x, coordinates.y, 2, 0, 2 * Math.PI);
  drawingContext.stroke();
  if (!label) return;
  drawingContext.fillText(label, coordinates.x + 3, coordinates.y);
}
