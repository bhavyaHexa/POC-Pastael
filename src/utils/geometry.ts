import type { Rectangle } from './collision';

/**
 * Checks if a rectangle (e.g. a placed pocket) is completely inside another rectangle (e.g. the packing area).
 */
export function isInside(inner: Rectangle, outer: Rectangle): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}
