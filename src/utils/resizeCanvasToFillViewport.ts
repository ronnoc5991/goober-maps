function resizeCanvasToFillViewport({ canvas }: { canvas: HTMLCanvasElement }) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export default resizeCanvasToFillViewport;
