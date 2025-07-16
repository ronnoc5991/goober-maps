export type Coordinates = { x: number; y: number };

export type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export function normalizeCoordinates({
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

export function windowToViewportCoordinates({
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

export function viewportToWindowCoordinates({
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
