export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Checks if two rectangles intersect (overlap) in 2D space.
 */
export function intersects(rectA: Rectangle, rectB: Rectangle): boolean {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  );
}
