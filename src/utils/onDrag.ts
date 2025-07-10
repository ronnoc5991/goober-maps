type DragDelta = { x: number; y: number };
type MousePosition = { x: number; y: number };

type MouseState =
  | {
      status: "inactive";
    }
  | {
      status: "down-but-not-dragging";
      initialDownPosition: MousePosition;
    }
  | {
      status: "dragging";
      prevDragPosition: MousePosition;
    };

function onDrag({
  draggableElement,
  dragThreshold,
  callback,
}: {
  draggableElement: HTMLElement;
  dragThreshold: number;
  callback: (delta: DragDelta) => void;
}) {
  let mouseState: MouseState = { status: "inactive" };

  draggableElement.addEventListener("mousedown", (event) => {
    mouseState = {
      status: "down-but-not-dragging",
      initialDownPosition: { x: event.offsetX, y: event.offsetY },
    };
  });

  draggableElement.addEventListener("mouseup", () => {
    mouseState = { status: "inactive" };
  });

  draggableElement.addEventListener("mouseleave", () => {
    mouseState = { status: "inactive" };
  });

  draggableElement.addEventListener("mousemove", (event) => {
    if (mouseState.status === "inactive") return;

    const { offsetX: currentX, offsetY: currentY } = event;

    if (mouseState.status === "dragging") {
      const deltaX = mouseState.prevDragPosition.x - currentX;
      const deltaY = mouseState.prevDragPosition.y - currentY;

      callback({ x: deltaX, y: deltaY });

      mouseState.prevDragPosition = { x: currentX, y: currentY };
    } else {
      const hasDragStarted =
        Math.abs(mouseState.initialDownPosition.x - currentX) > dragThreshold ||
        Math.abs(mouseState.initialDownPosition.y - currentY) > dragThreshold;

      if (hasDragStarted) {
        mouseState = {
          status: "dragging",
          prevDragPosition: { x: currentX, y: currentY },
        };
      }
    }
  });
}

export default onDrag;
