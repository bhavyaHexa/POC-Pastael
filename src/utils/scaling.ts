export const SCALE = 10; // 1 cm = 10 px

/**
 * Converts a measurement from centimeters to SVG pixels.
 */
export function cmToPx(cm: number): number {
  return cm * SCALE;
}

/**
 * Converts a measurement from SVG pixels to centimeters.
 */
export function pxToCm(px: number): number {
  return px / SCALE;
}
